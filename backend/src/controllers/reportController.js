const db = require('../config/db');

/** GET /api/reports/consumption - Tüketim analizi raporu */
function getConsumptionReport(req, res) {
  try {
    const rows = db.prepare(
      `SELECT p.productID, p.productName, p.unit, c.categoryName,
              SUM(CASE WHEN sm.movementType IN ('OUT','WASTE') THEN sm.amount ELSE 0 END) as totalOut,
              SUM(CASE WHEN sm.movementType = 'IN' THEN sm.amount ELSE 0 END) as totalIn,
              COUNT(sm.movementID) as movementCount,
              MAX(sm.createdAt) as lastMovement
       FROM StockMovements sm
       JOIN Products p ON p.productID = sm.productID
       JOIN Categories c ON c.categoryID = p.categoryID
       WHERE sm.createdAt >= date('now', '-30 days')
         AND p.isDeleted = 0
       GROUP BY p.productID, p.productName, p.unit, c.categoryName
       ORDER BY totalOut DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** GET /api/reports/waste - İsraf/fire raporu */
function getWasteReport(req, res) {
  try {
    const rows = db.prepare(
      `SELECT p.productID, p.productName, p.unit, c.categoryName,
              SUM(sm.amount) as totalWaste,
              COUNT(sm.movementID) as wasteCount
       FROM StockMovements sm
       JOIN Products p ON p.productID = sm.productID
       JOIN Categories c ON c.categoryID = p.categoryID
       WHERE sm.movementType = 'WASTE'
         AND sm.createdAt >= date('now', '-30 days')
         AND p.isDeleted = 0
       GROUP BY p.productID, p.productName, p.unit, c.categoryName
       ORDER BY totalWaste DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** GET /api/reports/supplier-performance - Tedarikçi performans raporu */
function getSupplierPerformanceReport(req, res) {
  try {
    const rows = db.prepare(
      `SELECT s.supplierID, s.companyName, s.perfScore, s.isActive,
              COUNT(DISTINCT o.orderID) as orderCount,
              SUM(o.totalAmount) as totalOrderAmount
       FROM Suppliers s
       LEFT JOIN Orders o ON s.supplierID = o.supplierID AND o.isDeleted = 0
       WHERE s.isDeleted = 0
       GROUP BY s.supplierID, s.companyName, s.perfScore, s.isActive
       ORDER BY s.perfScore DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** GET /api/reports/audit - Denetim logları (Admin only) */
function getAuditLogs(req, res) {
  try {
    const { limit = 50 } = req.query;
    const rows = db.prepare(
      `SELECT al.logID, al.action, al.tableName, al.recordID, al.ipAddress,
              al.createdAt, u.fullName as userName
       FROM AuditLogs al
       LEFT JOIN Users u ON u.userID = al.userID
       ORDER BY al.createdAt DESC
       LIMIT ?`
    ).all(parseInt(limit));
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getConsumptionReport, getWasteReport, getSupplierPerformanceReport, getAuditLogs };
