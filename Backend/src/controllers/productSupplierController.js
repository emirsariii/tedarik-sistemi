const db = require('../config/db');
const { writeAuditLog } = require('../middleware/auditLog');

function getAll(req, res) {
  try {
    const rows = db.prepare(
      `SELECT ps.productSupplierID, ps.productID, ps.supplierID, ps.isPrimary, ps.unitPrice,
              p.productName, s.companyName, s.perfScore
       FROM ProductSuppliers ps
       JOIN Products p ON p.productID = ps.productID
       JOIN Suppliers s ON s.supplierID = ps.supplierID
       WHERE p.isDeleted = 0 AND s.isDeleted = 0
       ORDER BY ps.isPrimary DESC, s.perfScore DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function create(req, res) {
  const { productID, supplierID, isPrimary, unitPrice } = req.body;
  if (!productID || !supplierID)
    return res.status(400).json({ message: 'productID ve supplierID zorunludur.' });
  try {
    const result = db.prepare(
      `INSERT INTO ProductSuppliers (productID, supplierID, isPrimary, unitPrice)
       VALUES (?,?,?,?)`
    ).run(productID, supplierID, isPrimary ? 1 : 0, unitPrice || null);
    writeAuditLog(req, `Ürün-Tedarikçi ilişkisi eklendi: ${productID}-${supplierID}`, 'ProductSuppliers', result.lastInsertRowid);
    return res.status(201).json({ message: 'İlişki eklendi.', productSupplierID: result.lastInsertRowid });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(409).json({ message: 'Bu ilişki zaten mevcut.' });
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function update(req, res) {
  const { id } = req.params;
  const { isPrimary, unitPrice } = req.body;
  try {
    db.prepare(
      `UPDATE ProductSuppliers SET isPrimary=?, unitPrice=? WHERE productSupplierID=?`
    ).run(isPrimary !== undefined ? (isPrimary ? 1 : 0) : 0, unitPrice || null, id);
    writeAuditLog(req, `Ürün-Tedarikçi ilişkisi güncellendi: ${id}`, 'ProductSuppliers', parseInt(id));
    return res.json({ message: 'İlişki güncellendi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

function remove(req, res) {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM ProductSuppliers WHERE productSupplierID=?').run(id);
    writeAuditLog(req, `Ürün-Tedarikçi ilişkisi silindi: ${id}`, 'ProductSuppliers', parseInt(id));
    return res.json({ message: 'İlişki silindi.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getAll, create, update, remove };
