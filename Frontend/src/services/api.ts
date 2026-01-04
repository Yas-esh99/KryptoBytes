const BASE_URL = 'http://127.0.0.1:5000'; // Assuming default Flask port

const apiRequest = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('idToken');
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }

  return response.json();
};

export const apiLogin = (email, password) => {
    return apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  };
  
  export const apiSignup = (userData) => {
    return apiRequest('/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };
  
  export const getProfile = () => {
    return apiRequest('/profile');
  };
  
  export const sendTransaction = (recipientId: string, amount: number) => {
    return apiRequest('/transactions/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, amount }),
    });
  };
  
  export const getTransactions = (page = 1, limit = 10) => {
    return apiRequest(`/transactions?page=${page}&limit=${limit}`);
  };
