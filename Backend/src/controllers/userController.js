const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { writeAuditLog } = require('../middleware/auditLog');
const { validatePassword } = require('./authController');

/** GET /api/users - Tüm kullanıcıları listele (Sadece Admin) */
function getAll(req, res) {
  try {
    const rows = db.prepare(
      `SELECT u.userID, u.fullName, u.email, u.roleID, r.roleName, u.isActive, u.failedAttempts, u.createdAt
       FROM Users u
       JOIN Roles r ON u.roleID = r.roleID
       WHERE u.isDeleted = 0
       ORDER BY u.createdAt DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** POST /api/users - Yeni kullanıcı ekle (Sadece Admin) */
function create(req, res) {
  const { fullName, email, password, roleName } = req.body;
  if (!fullName || !email || !password || !roleName)
    return res.status(400).json({ message: 'fullName, email, password ve roleName zorunludur.' });
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid)
    return res.status(400).json({ message: passwordValidation.message });
  try {
    // Rol kontrolü
    const role = db.prepare('SELECT roleID FROM Roles WHERE roleName=?').get(roleName);
    if (!role) return res.status(400).json({ message: 'Geçersiz rol.' });

    // Email kontrolü
    const existing = db.prepare('SELECT userID FROM Users WHERE email=? AND isDeleted=0').get(email);
    if (existing) return res.status(409).json({ message: 'Bu e-posta zaten kullanımda.' });

    // Şifre hashleme
    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(
      `INSERT INTO Users (roleID, fullName, email, passwordHash)
       VALUES (?,?,?,?)`
    ).run(role.roleID, fullName, email, passwordHash);

    writeAuditLog(req, `Kullanıcı eklendi: ${email}`, 'Users', result.lastInsertRowid);
    return res.status(201).json({ message: 'Kullanıcı eklendi.', userID: result.lastInsertRowid });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı.' });
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** PATCH /api/users/:id - Kullanıcı güncelle (Sadece Admin) */
function update(req, res) {
  const { id } = req.params;
  const { fullName, roleName, isActive } = req.body;
  if (!fullName || !roleName)
    return res.status(400).json({ message: 'fullName ve roleName zorunludur.' });
  try {
    const role = db.prepare('SELECT roleID FROM Roles WHERE roleName=?').get(roleName);
    if (!role) return res.status(400).json({ message: 'Geçersiz rol.' });
    db.prepare(
      `UPDATE Users SET fullName=?, roleID=?, isActive=?
       WHERE userID=?`
    ).run(fullName, role.roleID, isActive !== undefined ? (isActive ? 1 : 0) : 1, id);
    writeAuditLog(req, `Kullanıcı güncellendi: ${id}`, 'Users', parseInt(id));
    return res.json({ message: 'Kullanıcı güncellendi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** DELETE /api/users/:id - Kullanıcı sil (Sadece Admin) */
function remove(req, res) {
  const { id } = req.params;
  try {
    db.prepare('UPDATE Users SET isDeleted=1 WHERE userID=?').run(id);
    writeAuditLog(req, `Kullanıcı silindi: ${id}`, 'Users', parseInt(id));
    return res.json({ message: 'Kullanıcı silindi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** POST /api/users/:id/reset-password - Şifre sıfırla (Sadece Admin) */
function resetPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword)
    return res.status(400).json({ message: 'newPassword zorunludur.' });
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid)
    return res.status(400).json({ message: passwordValidation.message });
  try {
    const user = db.prepare('SELECT userID FROM Users WHERE userID=? AND isDeleted=0').get(id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE Users SET passwordHash=?, failedAttempts=0, lockedUntil=NULL WHERE userID=?')
      .run(passwordHash, id);

    writeAuditLog(req, `Şifre sıfırlandı: ${id}`, 'Users', parseInt(id));
    return res.json({ message: 'Şifre sıfırlandı.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getAll, create, update, remove, resetPassword };
