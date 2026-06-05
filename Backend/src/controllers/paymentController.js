const db = require('../config/db');
const { writeAuditLog } = require('../middleware/auditLog');

function getAll(req, res) {
  try {
    const rows = db.prepare(
      `SELECT p.paymentID, p.orderID, p.amount, p.paymentMethod, p.paymentDate,
              p.invoiceNumber, p.note, o.totalAmount AS orderTotal,
              s.companyName AS supplierName, u.fullName AS paidBy
       FROM Payments p
       JOIN Orders o ON o.orderID = p.orderID
       JOIN Suppliers s ON s.supplierID = o.supplierID
       JOIN Users u ON u.userID = p.paidByID
       WHERE p.isDeleted = 0
       ORDER BY p.paymentDate DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function create(req, res) {
  const { orderID, amount, paymentMethod, invoiceNumber, note } = req.body;
  if (!orderID || !amount)
    return res.status(400).json({ message: 'orderID ve amount zorunludur.' });
  try {
    const order = db.prepare('SELECT orderID FROM Orders WHERE orderID=? AND isDeleted=0').get(orderID);
    if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı.' });
    const result = db.prepare(
      `INSERT INTO Payments (orderID, paidByID, amount, paymentMethod, invoiceNumber, note)
       VALUES (?,?,?,?,?,?)`
    ).run(orderID, req.user.userID, amount, paymentMethod || 'BankTransfer', invoiceNumber || null, note || null);
    writeAuditLog(req, `Ödeme kaydedildi: ${result.lastInsertRowid}`, 'Payments', result.lastInsertRowid);
    return res.status(201).json({ message: 'Ödeme kaydedildi.', paymentID: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function remove(req, res) {
  const { id } = req.params;
  try {
    db.prepare('UPDATE Payments SET isDeleted=1 WHERE paymentID=?').run(id);
    writeAuditLog(req, `Ödeme silindi: ${id}`, 'Payments', parseInt(id));
    return res.json({ message: 'Ödeme silindi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getAll, create, remove };
