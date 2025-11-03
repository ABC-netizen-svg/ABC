
import axiosInstance from '../api/axiosInstance';

const opsService = {
  // Get pending reports
  getPendingReports: async () => {
    try {
      const response = await axiosInstance.get('/reports/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      throw error;
    }
  },

  // Sync single report
  syncReport: async (reportId) => {
    try {
      const response = await axiosInstance.post(`/reports/${reportId}/sync`);
      return response.data;
    } catch (error) {
      console.error('Error syncing report:', error);
      throw error;
    }
  },

  // Sync all reports
  syncAllReports: async () => {
    try {
      const response = await axiosInstance.post('/reports/sync-all');
      return response.data;
    } catch (error) {
      console.error('Error syncing all reports:', error);
      throw error;
    }
  },

  // Get transfer logs with optional date filtering
  getTransferLogs: async (startDate, endDate) => {
    try {
      let url = '/transfer-logs';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfer logs:', error);
      throw error;
    }
  },

  // ✅ NEW METHOD - Add this
  checkNewReports: async (lastCheckTime) => {
    try {
      let url = '/reports/check-new';
      
      if (lastCheckTime) {
        const params = new URLSearchParams();
        params.append('lastCheck', lastCheckTime.toISOString());
        url += '?' + params.toString();
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error checking new reports:', error);
      throw error;
    }
  },
};

export default opsService;