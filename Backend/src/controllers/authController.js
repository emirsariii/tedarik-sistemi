const db      = require('../config/db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { writeAuditLog } = require('../middleware/auditLog');

const MAX_ATTEMPTS    = parseInt(process.env.MAX_FAILED_ATTEMPTS) || 5;
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_MINUTES)     || 30;

function validatePassword(password) {
  if (!password || password.length < 8)
    return { valid: false, message: 'Şifre en az 8 karakter olmalıdır.' };
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasUpperCase)
    return { valid: false, message: 'Şifre en az bir büyük harf içermelidir.' };
  if (!hasLowerCase)
    return { valid: false, message: 'Şifre en az bir küçük harf içermelidir.' };
  if (!hasNumber)
    return { valid: false, message: 'Şifre en az bir rakam içermelidir.' };
  if (!hasSpecial)
    return { valid: false, message: 'Şifre en az bir özel karakter içermelidir.' };
  return { valid: true };
}

/** POST /api/auth/login */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });

  const user = db.prepare('SELECT u.*, r.roleName FROM Users u JOIN Roles r ON u.roleID = r.roleID WHERE u.email = ? AND u.isDeleted = 0').get(email);
  if (!user)
    return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date())
    return res.status(403).json({ message: `Hesap ${LOCKOUT_MINUTES} dakika kilitli. Lütfen daha sonra tekrar deneyin.` });

  if (user.passwordHash === '__PENDING__')
    return res.status(500).json({ message: 'Kullanıcı şifresi henüz ayarlanmamış.' });

  bcrypt.compare(password, user.passwordHash, (err, result) => {
    if (err || !result) {
      const newAttempts = user.failedAttempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
        db.prepare('UPDATE Users SET failedAttempts=?, lockedUntil=? WHERE userID=?').run(newAttempts, lockUntil, user.userID);
        return res.status(403).json({ message: `Çok fazla hatalı giriş. Hesap ${LOCKOUT_MINUTES} dakika kilitli.` });
      }
      db.prepare('UPDATE Users SET failedAttempts=? WHERE userID=?').run(newAttempts, user.userID);
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    db.prepare('UPDATE Users SET failedAttempts=0, lockedUntil=NULL WHERE userID=?').run(user.userID);
    const token = jwt.sign({ userID: user.userID, roleName: user.roleName }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30m' });
    writeAuditLog(req, 'Kullanıcı giriş yaptı', 'Users', user.userID);
    return res.json({ token, user: { userID: user.userID, fullName: user.fullName, email: user.email, roleName: user.roleName } });
  });
}

function logout(req, res) {
  writeAuditLog(req, 'Kullanıcı çıkış yaptı', 'Users', req.user?.userID);
  return res.json({ message: 'Çıkış başarılı.' });
}

module.exports = { login, logout, validatePassword };
