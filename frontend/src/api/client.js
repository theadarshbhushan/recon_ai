import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default client;
