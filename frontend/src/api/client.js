import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to Authorization headers automatically
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Redirect to /login if backend returns 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token to avoid endless loops
      localStorage.removeItem('token');
      // Only redirect if we are not already on the login/register page to prevent flickering loops
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Register a new user account.
 */
export const registerUser = async (email, password, fullName) => {
  const response = await client.post('/auth/register', {
    email,
    password,
    full_name: fullName,
  });
  return response.data;
};

/**
 * Login user and retrieve JWT access token.
 */
export const loginUser = async (email, password) => {
  const response = await client.post('/auth/login', {
    email,
    password,
  });
  return response.data; // { access_token, token_type }
};

/**
 * Fetch profile data of the currently logged-in user.
 */
export const getMe = async () => {
  const response = await client.get('/auth/me');
  return response.data; // { email, full_name, created_at }
};

/**
 * Health check endpoint.
 */
export const healthCheck = async () => {
  const response = await client.get('/health');
  return response.data;
};

/**
 * Fetch reconciliation aggregated summary KPIs.
 */
export const getSummary = async () => {
  const response = await client.get('/summary');
  return response.data;
};

/**
 * Retrieve paginated and filtered exception items.
 * @param {Object} filters - filters like page, page_size, category, min_severity
 */
export const getExceptions = async (filters = {}) => {
  const response = await client.get('/exceptions', { params: filters });
  return response.data;
};

/**
 * Fetch details of a specific settlement batch ID.
 * @param {string} batchId
 */
export const getBatch = async (batchId) => {
  const response = await client.get(`/batch/${batchId}`);
  return response.data;
};

/**
 * Retrieve list of all settlement batches.
 */
export const getBatches = async () => {
  const response = await client.get('/batches');
  return response.data;
};

/**
 * Trigger full pipeline reconciliation execution.
 * @param {string} mode - 'ground_truth' or 'hard'
 */
export const reconcile = async (mode = 'ground_truth') => {
  const response = await client.post('/reconcile', null, {
    params: { mode },
  });
  return response.data;
};

/**
 * Predict clean/anomalous reconciliation status for a single transaction.
 * @param {Object} features - PredictRequest payload
 * @param {boolean} explain - whether to trigger live LLM explainers
 */
export const predict = async (features, explain = false) => {
  const response = await client.post('/predict', features, {
    params: { explain },
  });
  return response.data;
};

/**
 * Fetch ML classifier diagnostic benchmarks.
 */
export const getBenchmark = async () => {
  const response = await client.get('/benchmark');
  return response.data;
};

/**
 * Fetch Hard Mode diagnostics summary aggregated stats.
 */
export const getDiagnosticsSummary = async () => {
  const response = await client.get('/diagnostics/summary');
  return response.data;
};

export default client;
