const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { initializeApp } = require('firebase-admin/app');

initializeApp();
const db = getFirestore();

exports.checkout = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Silakan login terlebih dahulu.');
  const { items, customer, phone, address, fulfillment, payment, note = '' } = request.data || {};
  if (!Array.isArray(items) || !items.length || !customer?.trim() || !phone?.trim() || !address?.trim() || !fulfillment || !payment) {
    throw new HttpsError('invalid-argument', 'Data checkout belum lengkap.');
  }

  const quantities = new Map();
  for (const item of items) {
    if (!item?.id || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new HttpsError('invalid-argument', 'Item keranjang tidak valid.');
    }
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
  }

  return db.runTransaction(async (transaction) => {
    const resolved = [];
    let subtotal = 0;
    for (const [id, quantity] of quantities) {
      const reference = db.collection('products').doc(id);
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) throw new HttpsError('not-found', 'Produk tidak ditemukan.');
      const product = snapshot.data();
      if (!Number.isInteger(product.stock) || product.stock < quantity) {
        throw new HttpsError('failed-precondition', `${product.name || 'Produk'} tidak memiliki stok cukup.`);
      }
      const price = Number(product.price);
      subtotal += price * quantity;
      resolved.push({ id, name: product.name, price, quantity, reference, stock: product.stock });
    }
    const discount = 0;
    const shipping = fulfillment === 'Pickup' ? 0 : fulfillment === 'Express' ? 18000 : 10000;
    const tax = Math.round((subtotal - discount) * 0.11);
    const total = subtotal - discount + shipping + tax;
    const orderRef = db.collection('orders').doc();
    const order = {
      id: orderRef.id, buyerId: request.auth.uid, customer: customer.trim(), phone: phone.trim(),
      address: address.trim(), fulfillment, payment, note: String(note).trim(), status: 'Pending',
      subtotal, discount, shipping, tax, total,
      items: resolved.map(({ reference, stock, ...item }) => item), createdAt: FieldValue.serverTimestamp(),
    };
    resolved.forEach((item) => transaction.update(item.reference, { stock: item.stock - item.quantity, updatedAt: FieldValue.serverTimestamp() }));
    transaction.set(orderRef, order);
    transaction.set(db.collection('notifications').doc(), {
      target: 'admin', orderId: orderRef.id, eventKey: `order-created-${orderRef.id}`, read: false,
      icon: '📦', title: 'Ada Pesanan Baru', description: `${order.customer} membuat pesanan ${orderRef.id}.`, createdAt: FieldValue.serverTimestamp(),
    });
    return { orderId: orderRef.id };
  });
});
