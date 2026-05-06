import axios from 'axios';

const API_BASE_URL = 'https://cposimulator-production.up.railway.app/api'; // Adjust based on user backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chargingSessionApi = {
  // POST /api/ChargingSession/connector-status-change
  changeConnectorStatus: (data) => api.post('/ChargingSession/connector-status-change', data),

  // POST /api/ChargingSession/session-started
  startSession: (data) => api.post('/ChargingSession/session-started', data),

  // POST /api/ChargingSession/session-stopped
  stopSession: (data) => api.post('/ChargingSession/session-stopped', data),

  // GET /api/ChargingSession/list/accounts
  getAccounts: () => api.get('/ChargingSession/list/accounts'),

  // GET /api/ChargingSession/list/stations?accountId=...
  getStations: (accountId) => api.get(`/ChargingSession/list/stations?accountId=${accountId}`),

  // GET /api/ChargingSession/list/evchargers?stationId=...
  getChargers: (stationId) => api.get(`/ChargingSession/list/evchargers?stationId=${stationId}`),

  // GET /api/ChargingSession/list/connectors?evchargerId=...
  getConnectors: (evchargerId) => api.get(`/ChargingSession/list/connectors?evchargerId=${evchargerId}`),

  // POST /api/ChargingSession/demo/start-random-sessions?count=...&updatesPerSession=...
  startRandomSessions: (count = 1, updatesPerSession = 5) =>
    api.post(`/ChargingSession/demo/start-random-sessions?count=${count}&updatesPerSession=${updatesPerSession}`),
};

export const simulationApi = {
  // GET /api/Simulation/demo-connectors
  getDemoConnectors: () => api.get('/Simulation/demo-connectors'),

  // GET /api/Simulation/active-sessions
  getActiveSessions: () => api.get('/Simulation/active-sessions'),
};

export default api;
