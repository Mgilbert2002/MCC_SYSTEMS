/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = `${import.meta.env.VITE_API_URL || '/api'}`

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const createAuthHeader = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders()
})

export const api = {
    auth: {
      login: (data: { email: string; password: string }) => fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      register: (data: any) => fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    deliveries: {
      getAll: () => fetch(`${API_BASE}/deliveries`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/deliveries`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      getByDelivery: (deliveryId: number) => fetch(`${API_BASE}/deliveries/${deliveryId}`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    quality: {
      getAll: () => fetch(`${API_BASE}/quality`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      getByDelivery: (deliveryId: number) => fetch(`${API_BASE}/quality/${deliveryId}`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/quality`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      update: (testId: number, data: any) => fetch(`${API_BASE}/quality/${testId}`, {
        method: 'PUT',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      setDecision: (testId: number, data: any) => fetch(`${API_BASE}/quality/${testId}/decision`, {
        method: 'PUT',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    products: {
      getAll: () => fetch(`${API_BASE}/products`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      updatePrice: (productId: number, current_price: number) => fetch(`${API_BASE}/products/${productId}/price`, {
        method: 'PUT',
        headers: createAuthHeader(),
        body: JSON.stringify({ current_price })
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    sales: {
      getAll: () => fetch(`${API_BASE}/sales`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    payments: {
      getAll: () => fetch(`${API_BASE}/payments`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    tank: {
      get: () => fetch(`${API_BASE}/tank`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      update: (quantity: number) => fetch(`${API_BASE}/tank`, {
        method: 'PUT',
        headers: createAuthHeader(),
        body: JSON.stringify({ quantity })
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    announcements: {
      getAll: () => fetch(`${API_BASE}/announcements`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    },
   
    messages: {
      getAll: () => fetch(`${API_BASE}/messages`, {
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      create: (data: any) => fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: createAuthHeader(),
        body: JSON.stringify(data)
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      }),
      markRead: (id: number) => fetch(`${API_BASE}/messages/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      }).then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
    }
}