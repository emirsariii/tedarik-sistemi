const db = require('../config/db');

function getAll(req, res) {
  try {
    const rows = db.prepare(
      `SELECT notificationID, type, title, message, referenceID, isRead, createdAt
       FROM Notifications
       WHERE (userID = ? OR roleID = ? OR userID IS NULL OR roleID IS NULL)
       ORDER BY createdAt DESC`
    ).all(req.user.userID, req.user.roleID);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function markAsRead(req, res) {
  const { id } = req.params;
  try {
    db.prepare('UPDATE Notifications SET isRead=1 WHERE notificationID=?').run(id);
    return res.json({ message: 'Bildirim okundu olarak işaretlendi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function createNotification(db, userID, roleID, type, title, message, referenceID) {
  db.prepare(
    `INSERT INTO Notifications (userID, roleID, type, title, message, referenceID)
     VALUES (?,?,?,?,?,?)`
  ).run(userID || null, roleID || null, type, title, message, referenceID || null);
}

module.exports = { getAll, markAsRead, createNotification };
