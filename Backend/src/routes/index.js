const express  = require('express');
const router   = express.Router();

const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/rbac');

const authCtrl               = require('../controllers/authController');
const invCtrl                = require('../controllers/inventoryController');
const prCtrl                 = require('../controllers/purchaseRequestController');
const orderCtrl              = require('../controllers/orderController');
const productCtrl            = require('../controllers/productController');
const supplierCtrl           = require('../controllers/supplierController');
const catCtrl                = require('../controllers/categoryController');
const userCtrl               = require('../controllers/userController');
const reportCtrl             = require('../controllers/reportController');
const paymentCtrl            = require('../controllers/paymentController');
const notificationCtrl       = require('../controllers/notificationController');
const productSupplierCtrl    = require('../controllers/productSupplierController');

// ── Auth ──────────────────────────────────────────────────────
router.post('/auth/login',  authCtrl.login);
router.post('/auth/logout', authenticate, authCtrl.logout);

// ── Categories ────────────────────────────────────────────────
router.get('/categories', authenticate, catCtrl.getAll);

// ── Products ──────────────────────────────────────────────────
router.get('/products',      authenticate, productCtrl.getAll);
router.post('/products',     authenticate, authorize('Admin','DepoSorumlusu'), productCtrl.create);
router.patch('/products/:id',authenticate, authorize('Admin','DepoSorumlusu'), productCtrl.update);
router.delete('/products/:id',authenticate, authorize('Admin','DepoSorumlusu'), productCtrl.remove);

// ── Inventory ─────────────────────────────────────────────────
router.get('/inventory',                 authenticate, invCtrl.getAll);
router.get('/inventory/expiry-warnings', authenticate, authorize('Admin','DepoSorumlusu','Yonetici'), invCtrl.getExpiryWarnings);
router.post('/inventory/movement',       authenticate, authorize('Admin','DepoSorumlusu'), invCtrl.addMovement);

// ── Purchase Requests ─────────────────────────────────────────
router.get('/purchase-requests',                    authenticate, prCtrl.getAll);
router.post('/purchase-requests',                   authenticate, authorize('Admin','DepoSorumlusu'), prCtrl.create);
router.patch('/purchase-requests/:id/approve',      authenticate, authorize('Admin','Yonetici'), prCtrl.resolve);
router.get('/purchase-requests/consumption/:productID', authenticate, prCtrl.getConsumptionData);

// ── Orders ────────────────────────────────────────────────────
router.get('/orders',                     authenticate, orderCtrl.getAll);
router.get('/orders/:id/details',         authenticate, orderCtrl.getDetails);
router.post('/orders',                    authenticate, authorize('Admin','SatinAlmaSorumlusu'), orderCtrl.create);
router.patch('/orders/:id/admin-approve', authenticate, authorize('Admin'), orderCtrl.adminApprove);
router.post('/orders/:id/receive',        authenticate, authorize('Admin','DepoSorumlusu'), orderCtrl.receiveDelivery);

// ── Suppliers ─────────────────────────────────────────────────
router.get('/suppliers',       authenticate, supplierCtrl.getAll);
router.post('/suppliers',      authenticate, authorize('Admin','SatinAlmaSorumlusu'), supplierCtrl.create);
router.patch('/suppliers/:id',authenticate, authorize('Admin','SatinAlmaSorumlusu'), supplierCtrl.update);
router.delete('/suppliers/:id',authenticate, authorize('Admin'), supplierCtrl.remove);

// ── Users (Admin only) ────────────────────────────────────────
router.get('/users',           authenticate, authorize('Admin'), userCtrl.getAll);
router.post('/users',          authenticate, authorize('Admin'), userCtrl.create);
router.patch('/users/:id',     authenticate, authorize('Admin'), userCtrl.update);
router.delete('/users/:id',    authenticate, authorize('Admin'), userCtrl.remove);
router.post('/users/:id/reset-password', authenticate, authorize('Admin'), userCtrl.resetPassword);

// ── Reports ─────────────────────────────────────────────────────
router.get('/reports/consumption',           authenticate, authorize('Admin','Yonetici'), reportCtrl.getConsumptionReport);
router.get('/reports/waste',                 authenticate, authorize('Admin','Yonetici'), reportCtrl.getWasteReport);
router.get('/reports/supplier-performance',  authenticate, authorize('Admin','SatinAlmaSorumlusu','Yonetici'), reportCtrl.getSupplierPerformanceReport);
router.get('/reports/audit',                 authenticate, authorize('Admin'), reportCtrl.getAuditLogs);

// ── Payments ───────────────────────────────────────────────────
router.get('/payments',       authenticate, authorize('Admin','Yonetici'), paymentCtrl.getAll);
router.post('/payments',      authenticate, authorize('Admin','Yonetici'), paymentCtrl.create);
router.delete('/payments/:id',authenticate, authorize('Admin'), paymentCtrl.remove);

// ── Notifications ───────────────────────────────────────────────
router.get('/notifications',       authenticate, notificationCtrl.getAll);
router.patch('/notifications/:id/read', authenticate, notificationCtrl.markAsRead);

// ── Product Suppliers ──────────────────────────────────────────
router.get('/product-suppliers',       authenticate, productSupplierCtrl.getAll);
router.post('/product-suppliers',      authenticate, authorize('Admin','SatinAlmaSorumlusu'), productSupplierCtrl.create);
router.patch('/product-suppliers/:id',authenticate, authorize('Admin','SatinAlmaSorumlusu'), productSupplierCtrl.update);
router.delete('/product-suppliers/:id',authenticate, authorize('Admin'), productSupplierCtrl.remove);

module.exports = router;
