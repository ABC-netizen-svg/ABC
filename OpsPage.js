
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../context/AuthContext';
import opsService from '../services/opsService';
import "./OpsPage.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Notification from '../components/notification/notification';

const OpsPage = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchReports, setSearchReports] = useState("");
  const [searchLogs, setSearchLogs] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSyncIndex, setCurrentSyncIndex] = useState(0);
  const [totalSync, setTotalSync] = useState(0);
  const [error, setError] = useState(null);

  // For new reports notification
  const [lastCheckTime, setLastCheckTime] = useState(new Date());
  const [newReportsAlert, setNewReportsAlert] = useState(null);
  
  // ✅ NEW - Track which reports we've already alerted about
  const alertedReportsRef = useRef(new Set());

  // Fetch pending reports on component mount
  useEffect(() => {
    fetchPendingReports();
    fetchTransferLogs();
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // ✅ FIXED - Poll for new reports with tracking
  useEffect(() => {
    const pollForNewReports = async () => {
      try {
        const result = await opsService.checkNewReports(lastCheckTime);
        
        if (result.hasNew) {
          console.log(`Found ${result.count} new reports:`, result.reports);
          
          // ✅ Filter out reports we've already alerted about
          const newUnalertedReports = result.reports.filter(
            reportName => !alertedReportsRef.current.has(reportName)
          );
          
          // ✅ Only show alert if there are NEW reports we haven't alerted about
          if (newUnalertedReports.length > 0) {
            // Set alert state
            setNewReportsAlert({
              count: newUnalertedReports.length,
              reports: newUnalertedReports
            });
            
            // Browser notification
            if (Notification.permission === "granted") {
              const reportList = newUnalertedReports.slice(0, 3).join('\n');
              const moreText = newUnalertedReports.length > 3 
                ? `\n...and ${newUnalertedReports.length - 3} more` 
                : '';
              
              new Notification("📥 New Reports Uploaded!", {
                body: `${newUnalertedReports.length} new report(s) ready to sync:\n${reportList}${moreText}`,
                icon: '/logo192.png',
                tag: 'new-reports',
                requireInteraction: false
              });
            }
            
            // ✅ Mark these reports as alerted
            newUnalertedReports.forEach(reportName => {
              alertedReportsRef.current.add(reportName);
            });
          }
          
          // Update last check time
          setLastCheckTime(new Date(result.latestTimestamp));
        }
      } catch (error) {
        console.error('Error checking for new reports:', error);
      }
    };

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(pollForNewReports, 5000);

    // Poll every 30 seconds
    const interval = setInterval(pollForNewReports, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [lastCheckTime]);

  // ✅ NEW - Clear alerted reports when they're synced
  const clearAlertedReport = (reportName) => {
    alertedReportsRef.current.delete(reportName);
  };

  const fetchPendingReports = async () => {
    try {
      setLoading(true);
      const data = await opsService.getPendingReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pending reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferLogs = async () => {
    try {
      const data = await opsService.getTransferLogs(startDate, endDate);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch transfer logs:', err);
    }
  };

  const handleSync = async (reportId) => {
    try {
      setIsSyncing(true);
      setCurrentSyncIndex(1);
      setTotalSync(1);

      const result = await opsService.syncReport(reportId);

      // ✅ Clear from alerted set when synced
      const syncedReport = reports.find(r => r.id === reportId);
      if (syncedReport) {
        clearAlertedReport(syncedReport.name);
      }

      // Refetch pending reports and transfer logs
      await fetchPendingReports();
      await fetchTransferLogs();

      setError(null);
    } catch (err) {
      setError(`Failed to sync report: ${err.message}`);
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all pending reports
  const handleSyncAll = async () => {
    const pendingReports = reports.filter(r => r.status === 'pending' || r.status === 'Pending');
    if (pendingReports.length === 0) return;

    try {
      setIsSyncing(true);
      setTotalSync(pendingReports.length);

      const result = await opsService.syncAllReports();

      // ✅ Clear all synced reports from alerted set
      pendingReports.forEach(report => {
        clearAlertedReport(report.name);
      });

      // Refetch pending reports and transfer logs
      await fetchPendingReports();
      await fetchTransferLogs();

      setError(null);
    } catch (err) {
      setError(`Failed to sync all reports: ${err.message}`);
      console.error(err);
    } finally {
      setIsSyncing(false);
      setCurrentSyncIndex(0);
      setTotalSync(0);
    }
  };

  // Date range helper
  const isWithinDateRange = (log) => {
    if (!startDate && !endDate) return true;
    const logDate = new Date(log.transferredAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || logDate >= start) && (!end || logDate <= end);
  };

  // Filters
  const filteredReports = reports.filter(
    (r) =>
      r.name.toLowerCase().includes(searchReports.toLowerCase()) ||
      r.date.includes(searchReports)
  );

  const filteredLogs = logs.filter(
    (log) =>
      log.reportName.toLowerCase().includes(searchLogs.toLowerCase()) &&
      isWithinDateRange(log)
  );

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.transferredAt) - new Date(a.transferredAt)
  );

  // Stats
  const totalReports = reports.length + logs.filter(l => l.status === 'synced' || l.status === 'failed').length;
  const syncedReports = logs.filter((l) => l.status === 'synced').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4 ops-page">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* New Reports Notification Alert */}
      {newReportsAlert && (
        <div 
          className="alert alert-primary alert-dismissible fade show position-fixed shadow-lg" 
          style={{
            top: '80px', 
            right: '20px', 
            zIndex: 9999, 
            minWidth: '380px', 
            maxWidth: '500px',
            animation: 'slideInRight 0.4s ease-out'
          }}
        >
          <div className="d-flex align-items-center mb-2">
            <span className="fs-3 me-2">📥</span>
            <strong className="fs-5">New Reports Uploaded!</strong>
          </div>
          <p className="mb-2">
            <strong>{newReportsAlert.count}</strong> new report(s) have been added to the queue and are ready to sync:
          </p>
          <ul className="mb-3 ps-3" style={{maxHeight: '120px', overflowY: 'auto'}}>
            {newReportsAlert.reports.slice(0, 5).map((name, idx) => (
              <li key={idx} className="small mb-1">
                <code>{name}</code>
              </li>
            ))}
            {newReportsAlert.reports.length > 5 && (
              <li className="small text-muted">
                ...and {newReportsAlert.reports.length - 5} more
              </li>
            )}
          </ul>
          <div className="d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-sm btn-primary"
              onClick={async () => {
                await fetchPendingReports();
                setNewReportsAlert(null);
              }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh Reports
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setNewReportsAlert(null)}
            >
              Dismiss
            </button>
          </div>
          <button 
            type="button" 
            className="btn-close position-absolute top-0 end-0 m-2" 
            onClick={() => setNewReportsAlert(null)}
          ></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Reports & Logs</h2>
        <div className="position-relative">
          <button
            className="btn btn-outline-primary position-relative"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <i className="bi bi-bell-fill"></i>
            {pendingReports > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {pendingReports}
              </span>
            )}
          </button>
          <Notification
            reports={reports}
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm summary-card">
            <div className="card-body">
              <h5 className="card-title">Total Reports</h5>
              <p className="card-text fs-4">{totalReports}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm summary-card synced">
            <div className="card-body">
              <h5 className="card-title">Synced Reports</h5>
              <p className="card-text fs-4">{syncedReports}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm summary-card pending">
            <div className="card-body">
              <h5 className="card-title">Pending Reports</h5>
              <p className="card-text fs-4">{pendingReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports to be synced */}
      <div className="mb-5">
        <h4 className="mb-2 fw-semibold">Reports to be Synced</h4>

        {isSyncing && (
          <div className="mb-2 text-info fw-semibold">
            Syncing report {currentSyncIndex} of {totalSync}...
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name or date..."
            value={searchReports}
            onChange={(e) => setSearchReports(e.target.value)}
            className="form-control w-75"
          />
          <button
            onClick={handleSyncAll}
            className="btn btn-success btn-sm"
            disabled={pendingReports === 0 || isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </button>
        </div>

        <div className="table-container">
          <table className="table table-striped table-bordered mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Report Name</th>
                <th>Report Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="fade-in">
                    <td>{report.id}</td>
                    <td>{report.name}</td>
                    <td>{report.date}</td>
                    <td className="text-warning fw-bold">{report.status}</td>
                    <td>
                      <button
                        onClick={() => handleSync(report.id)}
                        className="btn btn-primary btn-sm"
                        disabled={isSyncing}
                      >
                        {isSyncing ? 'Syncing...' : 'Sync'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No reports to be synced found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer logs */}
      <div>
        <h4 className="mb-2 fw-semibold">Activity Logs</h4>
        <div className="d-flex mb-3 gap-2 flex-wrap align-items-center">
          <input
            type="text"
            placeholder="Search Logs..."
            value={searchLogs}
            onChange={(e) => setSearchLogs(e.target.value)}
            className="form-control"
          />
          <div className="d-flex gap-2 align-items-center">
            <label>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                fetchTransferLogs();
              }}
              className="form-control"
            />
            <label>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                fetchTransferLogs();
              }}
              className="form-control"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table table-striped table-bordered mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Report Name</th>
                <th>Report Date</th>
                <th>Status</th>
                <th>Folder</th>
                <th>Transfer Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length > 0 ? (
                sortedLogs.map((log) => (
                  <tr key={log.id} className="fade-in">
                    <td>{log.id}</td>
                    <td>{log.reportName}</td>
                    <td>{log.reportDate}</td>
                    <td
                      className={
                        log.status === 'synced'
                          ? "text-success fw-bold"
                          : "text-danger fw-bold"
                      }
                    >
                      {log.status}
                      {log.errorMessage && <span className="ms-1" title={log.errorMessage}>❗</span>}
                    </td>
                    <td>{log.folder}</td>
                    <td>
                      {new Date(log.transferredAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No logs found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpsPage;