// import axiosInstance from '../api/axiosInstance';

// const opsService = {
//   // Fetch pending reports
//   getPendingReports: async () => {
//     try {
//       const response = await axiosInstance.get('/reports/pending');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching pending reports:', error);
//       throw error;
//     }
//   },

//   // Sync single report
//   syncReport: async (reportId) => {
//     try {
//       const response = await axiosInstance.put(`/reports/${reportId}/sync`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error syncing report ${reportId}:`, error);
//       throw error;
//     }
//   },

//   // Sync all pending reports
//   syncAllReports: async () => {
//     try {
//       const response = await axiosInstance.put('/reports/sync-all');
//       return response.data;
//     } catch (error) {
//       console.error('Error syncing all reports:', error);
//       throw error;
//     }
//   },

//   // Fetch transfer logs
//   getTransferLogs: async (startDate, endDate) => {
//     try {
//       const params = {};
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;

//       const response = await axiosInstance.get('/transfer-logs', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching transfer logs:', error);
//       throw error;
//     }
//   },
// };

// export default opsService;
// import axios from 'axios';

// const API_URL = 'http://localhost:8080/api/operations';

// const opsService = {
//   getPendingPathConfigs: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/path-configs/pending`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching pending path configs:', error);
//       throw error;
//     }
//   },

//   getStats: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/stats`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//       throw error;
//     }
//   },

//   syncFile: async (pathConfigId) => {
//     try {
//       const response = await axios.put(`${API_URL}/path-configs/${pathConfigId}/sync`);
//       return response.data;
//     } catch (error) {
//       console.error('Error syncing file:', error);
//       throw error;
//     }
//   },

//   syncAllFiles: async () => {
//     try {
//       const response = await axios.put(`${API_URL}/path-configs/sync-all`);
//       return response.data;
//     } catch (error) {
//       console.error('Error syncing all files:', error);
//       throw error;
//     }
//   },

//   getRecentLogs: async () => {
//     try {
//       const response = await axios.get(`${API_URL}/transfer-logs/recent`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching transfer logs:', error);
//       throw error;
//     }
//   },
// };

// export default opsService;
// import axios from 'axios';

// const API_URL = 'http://localhost:8080/api';

// const opsService = {
//   // Get pending reports
//   getPendingReports: async () => {
//     try {
//       console.log('🔵 Calling: GET /api/reports/pending');
//       const response = await axios.get(`${API_URL}/reports/pending`, {
//         withCredentials: true
//       });
//       console.log('🟢 Response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('🔴 Error:', error);
//       throw error;
//     }
//   },

//   // Sync single report
//   syncReport: async (reportId) => {
//     try {
//       console.log('🔵 Calling: POST /api/reports/' + reportId + '/sync');
//       const response = await axios.post(`${API_URL}/reports/${reportId}/sync`, {}, {
//         withCredentials: true
//       });
//       console.log('🟢 Response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('🔴 Error:', error);
//       throw error;
//     }
//   },

//   // Sync all reports
//   syncAllReports: async () => {
//     try {
//       console.log('🔵 Calling: POST /api/reports/sync-all');
//       const response = await axios.post(`${API_URL}/reports/sync-all`, {}, {
//         withCredentials: true
//       });
//       console.log('🟢 Response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('🔴 Error:', error);
//       throw error;
//     }
//   },

//   // Get transfer logs
//   getTransferLogs: async (startDate, endDate) => {
//     try {
//       let url = `${API_URL}/transfer-logs`;
//       const params = new URLSearchParams();
      
//       if (startDate) params.append('startDate', startDate);
//       if (endDate) params.append('endDate', endDate);
      
//       if (params.toString()) {
//         url += '?' + params.toString();
//       }
      
//       console.log('🔵 Calling: GET', url);
//       const response = await axios.get(url, {
//         withCredentials: true
//       });
//       console.log('🟢 Response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('🔴 Error:', error);
//       throw error;
//     }
//   },
// };

// export default opsService;
import axiosInstance from '../api/axiosInstance';  // Use YOUR axios instance

const opsService = {
  // Get pending reports
  getPendingReports: async () => {
    const response = await axiosInstance.get('/reports/pending');
    return response.data;
  },

  // Sync single report
  syncReport: async (reportId) => {
    const response = await axiosInstance.post(`/reports/${reportId}/sync`);
    return response.data;
  },

  // Sync all reports
  syncAllReports: async () => {
    const response = await axiosInstance.post('/reports/sync-all');
    return response.data;
  },

  // Get transfer logs
  getTransferLogs: async (startDate, endDate) => {
    let url = '/transfer-logs';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

export default opsService;