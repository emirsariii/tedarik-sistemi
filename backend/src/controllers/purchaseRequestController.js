const db = require('../config/db');
const { writeAuditLog } = require('../middleware/auditLog');

/** GET /api/purchase-requests */
function getAll(req, res) {
  try {
    const rows = db.prepare(
      `SELECT pr.requestID, p.productName, p.unit, pr.requestedQty, pr.status,
              pr.note, pr.approvalNote, pr.requestedAt, pr.resolvedAt,
              u1.fullName AS requesterName, u2.fullName AS approverName,
              i.quantity AS currentStock, i.reorderLevel
       FROM PurchaseRequests pr
       JOIN Products p  ON p.productID   = pr.productID
       JOIN Users    u1 ON u1.userID      = pr.requesterID
       LEFT JOIN Users u2 ON u2.userID   = pr.approverID
       LEFT JOIN Inventory i ON i.productID = p.productID
       WHERE pr.isDeleted = 0
       ORDER BY pr.requestedAt DESC`
    ).all();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** GET /api/purchase-requests/consumption/:productID */
function getConsumptionData(req, res) {
  const { productID } = req.params;
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const rows = db.prepare(
      `SELECT sm.amount, sm.movementType, sm.createdAt
       FROM StockMovements sm
       WHERE sm.productID = ? AND sm.movementType IN ('OUT','WASTE')
         AND sm.createdAt >= ?
       ORDER BY sm.createdAt DESC`
    ).all(productID, sevenDaysAgo);
    
    const totalConsumed = rows.reduce((sum, r) => sum + r.amount, 0);
    const avgDailyConsumption = totalConsumed / 7;
    const suggestedOrder = avgDailyConsumption > 0 ? Math.ceil(avgDailyConsumption * 7) : 0;
    
    return res.json({
      sevenDayConsumption: totalConsumed,
      avgDailyConsumption: avgDailyConsumption.toFixed(2),
      suggestedOrderQuantity: suggestedOrder
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** POST /api/purchase-requests */
function create(req, res) {
  const { productID, requestedQty, note } = req.body;
  if (!productID || !requestedQty)
    return res.status(400).json({ message: 'productID ve requestedQty zorunludur.' });

  try {
    const result = db.prepare(
      `INSERT INTO PurchaseRequests (productID, requesterID, requestedQty, note)
       VALUES (?,?,?,?)`
    ).run(productID, req.user.userID, requestedQty, note || null);

    writeAuditLog(req, 'Satın alma talebi oluşturuldu', 'PurchaseRequests', result.lastInsertRowid);
    return res.status(201).json({ message: 'Talep oluşturuldu.', requestID: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

/** PATCH /api/purchase-requests/:id/approve */
function resolve(req, res) {
  const { id } = req.params;
  const { status, approvalNote } = req.body;
  if (!status || !['Approved','Rejected'].includes(status))
    return res.status(400).json({ message: 'Geçersiz durum.' });
  if (status === 'Rejected' && !approvalNote)
    return res.status(400).json({ message: 'Red nedeni zorunludur.' });
  try {
    db.prepare(
      `UPDATE PurchaseRequests SET status=?, approverID=?, approvalNote=?, resolvedAt=datetime('now')
       WHERE requestID=?`
    ).run(status, req.user.userID, approvalNote || null, id);
    writeAuditLog(req, `Talep ${status}: ${id}`, 'PurchaseRequests', parseInt(id));
    return res.json({ message: `Talep ${status === 'Approved' ? 'onaylandı' : 'reddedildi'}.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getAll, create, resolve, getConsumptionData };
