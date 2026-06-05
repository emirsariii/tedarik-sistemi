/**
 * API katmanı — tüm backend iletişimi buradan geçer.
 */
const API_BASE = '/api';

let _token = null;

function setToken(t) { _token = t; }
function getToken()  { return _token; }

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.message || 'Hata oluştu.' };
  return data;
}

const api = {
  // Auth
  login:   (email, password) => request('POST', '/auth/login', { email, password }),
  logout:  ()                => request('POST', '/auth/logout'),

  // Categories
  getCategories: () => request('GET', '/categories'),

  // Products
  getProducts:   ()       => request('GET', '/products'),
  createProduct: (body)   => request('POST', '/products', body),
  updateProduct: (id, body) => request('PATCH', `/products/${id}`, body),
  deleteProduct: (id)     => request('DELETE', `/products/${id}`),

  // Inventory
  getInventory:       ()     => request('GET', '/inventory'),
  getExpiryWarnings:  ()     => request('GET', '/inventory/expiry-warnings'),
  addMovement:        (body) => request('POST', '/inventory/movement', body),

  // Purchase Requests
  getRequests:    ()           => request('GET', '/purchase-requests'),
  createRequest:  (body)       => request('POST', '/purchase-requests', body),
  resolveRequest: (id, body)   => request('PATCH', `/purchase-requests/${id}/approve`, body),

  // Orders
  getOrders:      ()           => request('GET', '/orders'),
  getOrderDetails:(id)         => request('GET', `/orders/${id}/details`),
  createOrder:    (body)       => request('POST', '/orders', body),
  adminApprove:   (id)         => request('PATCH', `/orders/${id}/admin-approve`),
  receiveOrder:   (id, body)   => request('POST', `/orders/${id}/receive`, body),

  // Suppliers
  getSuppliers:   ()     => request('GET', '/suppliers'),
  createSupplier: (body) => request('POST', '/suppliers', body),
  updateSupplier: (id, body) => request('PATCH', `/suppliers/${id}`, body),
  deleteSupplier: (id)   => request('DELETE', `/suppliers/${id}`),

  // Users (Admin only)
  getUsers:        ()              => request('GET', '/users'),
  createUser:       (body)         => request('POST', '/users', body),
  updateUser:       (id, body)     => request('PATCH', `/users/${id}`, body),
  deleteUser:       (id)           => request('DELETE', `/users/${id}`),
  resetUserPassword: (id, body)    => request('POST', `/users/${id}/reset-password`, body),

  // Reports
  getConsumptionReport:       () => request('GET', '/reports/consumption'),
  getWasteReport:            () => request('GET', '/reports/waste'),
  getSupplierPerformance:    () => request('GET', '/reports/supplier-performance'),
  getAuditLogs:              () => request('GET', '/reports/audit'),
};
