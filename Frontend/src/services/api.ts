const BASE_URL = 'http://127.0.0.1:5000'
//const BASE_URL = 'https://kryptobytes-7.onrender.com'; // Assuming default Flask port

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
    // Note: The backend now expects a 'publicKey' field for creating a user.
    // This should be generated on the client-side and included in the userData.
    return apiRequest('/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };
  
  export const getProfile = () => {
    return apiRequest('/profile');
  };
  
  export const sendTransaction = (message: object, signature: string) => {
    return apiRequest('/transactions/send', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });
  };
  
  export const getTransactions = (page = 1, limit = 10, status?: 'pending' | 'validated' | 'failed') => {
    let path = `/transactions?page=${page}&limit=${limit}`;
    if (status) {
      path += `&status=${status}`;
    }
    return apiRequest(path);
  };

  export const getUsers = () => {
    return apiRequest('/users');
  };

  export const stake = (amount: number) => {
    return apiRequest('/stake', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  };

  export const unstake = (amount: number) => {
    return apiRequest('/unstake', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  };

  export const validateTransaction = () => {
    return apiRequest('/transactions/validate', {
      method: 'POST',
    });
  };
