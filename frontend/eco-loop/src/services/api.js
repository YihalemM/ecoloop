const BASE_URL = 'http://localhost:5005/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Request Failed');
  return data;
};

export const ecoApi = {
  // Manufacturer Actions
  mintBottles: async (brand, count, co2PerBottle, description, material, manufacturerAddress) => {
    const res = await fetch(`${BASE_URL}/manufacturer/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, count, co2PerBottle, description, material, manufacturerAddress })
    });
    return handleResponse(res);
  },
  
  registerManufacturer: async (address, name) => {
    const res = await fetch(`${BASE_URL}/manufacturer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, name })
    });
    return handleResponse(res);
  },


  // User Actions
  scanBottle: async (barcode, userAddress) => {
    const res = await fetch(`${BASE_URL}/user/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode, userAddress })
    });
    return handleResponse(res);
  },

  getBalance: async (address) => {
    const res = await fetch(`${BASE_URL}/user/balance/${address}`);
    return handleResponse(res);
  },

  // Data Actions
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/stats`);
    return handleResponse(res);
  },

  getLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs`);
    return handleResponse(res);
  },

  getEvents: async () => {
    const res = await fetch(`${BASE_URL}/events`);
    return handleResponse(res);
  },

  getUserProfile: async (address) => {
    const res = await fetch(`${BASE_URL}/user/profile/${address}`);
    return handleResponse(res);
  },

  getManufacturerStats: async (address) => {
    const res = await fetch(`${BASE_URL}/manufacturer/stats/${address}`);
    return handleResponse(res);
  },

  withdraw: async (address, amount, currency, method) => {
    const res = await fetch(`${BASE_URL}/user/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, amount, currency, method })
    });
    return handleResponse(res);
  }
};
