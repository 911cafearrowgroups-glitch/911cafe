// 911 Cafe Client-Side Persistent Storage & Serverless Rehydration
const ORDERS_KEY = '911_cafe_orders_v1';
const CUSTOMERS_KEY = '911_cafe_customers_v1';
const CLEARED_AT_KEY = '911_cafe_cleared_at_v1';

export function getStoredClearedAt() {
  try {
    return Number(localStorage.getItem(CLEARED_AT_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

export function saveStoredClearedAt(ts) {
  try {
    if (ts) {
      localStorage.setItem(CLEARED_AT_KEY, String(ts));
    }
  } catch (e) {
    console.warn(e);
  }
}

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const clearedAt = getStoredClearedAt();
    if (clearedAt > 0) {
      return parsed.filter(o => {
        const ot = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return ot >= clearedAt;
      });
    }
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveStoredOrders(orders) {
  try {
    if (Array.isArray(orders)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (e) {
    console.warn('Failed to write orders to localStorage:', e);
  }
}

export function clearStoredOrders(clearedAt) {
  try {
    localStorage.removeItem(ORDERS_KEY);
    const ts = clearedAt || Date.now();
    saveStoredClearedAt(ts);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('911_orders_cleared', { detail: { clearedAt: ts } }));
    }
  } catch (e) {
    console.warn('Failed to clear orders from localStorage:', e);
  }
}

export function getStoredCustomers() {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredCustomers(customers) {
  try {
    if (Array.isArray(customers)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    }
  } catch (e) {
    console.warn('Failed to write customers to localStorage:', e);
  }
}

export function saveSingleStoredOrder(newOrder) {
  if (!newOrder || !newOrder.id) return;
  const existing = getStoredOrders();
  const idx = existing.findIndex(o => o.id === newOrder.id);
  let updated;
  if (idx >= 0) {
    updated = existing.map(o => o.id === newOrder.id ? { ...o, ...newOrder } : o);
  } else {
    updated = [newOrder, ...existing];
  }
  saveStoredOrders(updated);
  triggerServerSync();
  return updated;
}

export function updateStoredOrderStatus(orderId, newStatus, paymentMethod) {
  const existing = getStoredOrders();
  const nowIso = new Date().toISOString();
  const updated = existing.map(o => {
    if (o.id === orderId) {
      return {
        ...o,
        status: newStatus,
        paymentMethod: paymentMethod || o.paymentMethod || 'cash',
        updatedAt: nowIso
      };
    }
    return o;
  });
  saveStoredOrders(updated);
  return updated;
}

// Automatically syncs local browser database with server (e.g. rehydrates Vercel serverless container on cold start)
export async function triggerServerSync() {
  try {
    const orders = getStoredOrders();
    const customers = getStoredCustomers();
    const localClearedAt = getStoredClearedAt();

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders, customers, clientClearedAt: localClearedAt })
    });
    const data = await res.json();
    if (data && data.clearedAt) {
      if (data.clearedAt > localClearedAt) {
        clearStoredOrders(data.clearedAt);
      }
    }
  } catch (e) {
    // Network / offline error - silently retry later
  }
}
