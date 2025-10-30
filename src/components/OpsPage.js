

// // import React, { useState } from "react";
// // import reportsData from "../data/reports.json";
// // import "./OpsPage.css";
// // import 'bootstrap/dist/css/bootstrap.min.css';

// // const OpsPage = () => {
// //   const [reports, setReports] = useState(
// //     reportsData.map((r) => ({ ...r, status: "Pending" }))
// //   );
// //   const [logs, setLogs] = useState([]);
// //   const [searchReports, setSearchReports] = useState("");
// //   const [searchLogs, setSearchLogs] = useState("");
// //   const [startDate, setStartDate] = useState("");
// //   const [endDate, setEndDate] = useState("");

// //   // Progress state
// //   const [isSyncing, setIsSyncing] = useState(false);
// //   const [currentSyncIndex, setCurrentSyncIndex] = useState(0);
// //   const [totalSync, setTotalSync] = useState(0);

// //   // Simulate random failure (10%)
// //   // const simulateFailure = () => Math.random() < 0.1;
// //   const simulateFailure = () => false;

// //   // Sync single report
// //   const handleSync = async (reportId, index = 1, total = 1) => {
// //     setIsSyncing(true);
// //     setCurrentSyncIndex(index);
// //     setTotalSync(total);

// //     await new Promise((resolve) => setTimeout(resolve, 800));

// //     let newLog = null;

// //     const updatedReports = reports.map((report) => {
// //       if (report.id === reportId && report.status === "Pending") {
// //         if (simulateFailure()) {
// //           newLog = {
// //             id: report.id, // Reuse report ID
// //             name: report.name,
// //             reportDate: report.date,
// //             status: "Failed",
// //             folder: report.group || "Default",
// //             time: new Date().toISOString(),
// //             error: "Permission denied",
// //           };
// //         } else {
// //           newLog = {
// //             id: report.id, // Reuse report ID
// //             name: report.name,
// //             reportDate: report.date,
// //             status: "Synced",
// //             folder: report.group || "Default",
// //             time: new Date().toISOString(),
// //           };
// //         }
// //         return { ...report, status: newLog.status };
// //       }
// //       return report;
// //     });

// //     setReports(updatedReports.filter(r => r.status === "Pending")); // remove synced reports
// //     if (newLog) setLogs((prev) => [newLog, ...prev]);
// //     setIsSyncing(false);
// //   };

// //   // Sync all pending reports
// //   const handleSyncAll = async () => {
// //     const pendingReports = reports.filter((r) => r.status === "Pending");
// //     if (pendingReports.length === 0) return;

// //     setIsSyncing(true);
// //     setTotalSync(pendingReports.length);

// //     const newLogs = [];

// //     for (let i = 0; i < pendingReports.length; i++) {
// //       setCurrentSyncIndex(i + 1);
// //       await new Promise((resolve) => setTimeout(resolve, 800));

// //       const report = pendingReports[i];
// //       const status = simulateFailure() ? "Failed" : "Synced";

// //       newLogs.push({
// //         id: report.id, // Reuse report ID
// //         name: report.name,
// //         reportDate: report.date,
// //         status,
// //         folder: report.group || "Default",
// //         time: new Date().toISOString(),
// //         error: status === "Failed" ? "Permission denied" : null,
// //       });
// //     }

// //     // Remove synced reports from "Reports to be Synced"
// //     setReports((prev) => prev.filter((r) => r.status === "Pending" && !newLogs.find(l => l.name === r.name)));
// //     setLogs((prev) => [...newLogs, ...prev]);
// //     setIsSyncing(false);
// //   };

// //   // Date range helper
// //   const isWithinDateRange = (log) => {
// //     if (!startDate && !endDate) return true;
// //     const logDate = new Date(log.time);
// //     const start = startDate ? new Date(startDate) : null;
// //     const end = endDate ? new Date(endDate) : null;
// //     return (!start || logDate >= start) && (!end || logDate <= end);
// //   };

// //   // Filters
// //   const filteredReports = reports
// //     .filter((r) => r.status === "Pending")
// //     .filter(
// //       (r) =>
// //         r.name.toLowerCase().includes(searchReports.toLowerCase()) ||
// //         r.date.includes(searchReports)
// //     );

// //   const filteredLogs = logs
// //     .filter(
// //       (log) =>
// //         log.name.toLowerCase().includes(searchLogs.toLowerCase()) &&
// //         isWithinDateRange(log)
// //     );

// //   const sortedLogs = [...filteredLogs].sort(
// //     (a, b) => new Date(b.time) - new Date(a.time)
// //   );

// //   // Stats
// //   const totalReports = reports.length + logs.filter(l => l.status === "Synced" || l.status === "Failed").length;
// //   const syncedReports = logs.filter((l) => l.status === "Synced").length;
// //   const pendingReports = reports.filter((r) => r.status === "Pending").length;

// //   return (
// //     <div className="container my-4 ops-page">
// //       <h2 className="mb-4 text-center fw-bold">Operations Dashboard</h2>

// //       {/* Summary cards */}
// //       <div className="row mb-4">
// //         <div className="col-md-4">
// //           <div className="card text-center shadow-sm summary-card">
// //             <div className="card-body">
// //               <h5 className="card-title">Total Reports</h5>
// //               <p className="card-text fs-4">{totalReports}</p>
// //             </div>
// //           </div>
// //         </div>
// //         <div className="col-md-4">
// //           <div className="card text-center shadow-sm summary-card synced">
// //             <div className="card-body">
// //               <h5 className="card-title">Synced Reports</h5>
// //               <p className="card-text fs-4">{syncedReports}</p>
// //             </div>
// //           </div>
// //         </div>
// //         <div className="col-md-4">
// //           <div className="card text-center shadow-sm summary-card pending">
// //             <div className="card-body">
// //               <h5 className="card-title">Pending Reports</h5>
// //               <p className="card-text fs-4">{pendingReports}</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Reports to be synced */}
// //       <div className="mb-5">
// //         <h4 className="mb-2 fw-semibold">Reports to be Synced</h4>

// //         {isSyncing && (
// //           <div className="mb-2 text-info fw-semibold">
// //             Syncing report {currentSyncIndex} of {totalSync}...
// //           </div>
// //         )}

// //         <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
// //           <input
// //             type="text"
// //             placeholder="Search by name or date..."
// //             value={searchReports}
// //             onChange={(e) => setSearchReports(e.target.value)}
// //             className="form-control w-75"
// //           />
// //           <button
// //             onClick={handleSyncAll}
// //             className="btn btn-success btn-sm"
// //             disabled={pendingReports === 0 || isSyncing}
// //           >
// //             Sync All
// //           </button>
// //         </div>

// //         <div className="table-container">
// //           <table className="table table-striped table-bordered mb-0">
// //             <thead className="table-dark">
// //               <tr>
// //                 <th>ID</th>
// //                 <th>Report Name</th>
// //                 <th>Report Date</th>
// //                 <th>Status</th>
// //                 <th>Action</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filteredReports.length > 0 ? (
// //                 filteredReports.map((report) => (
// //                   <tr key={report.id} className="fade-in">
// //                     <td>{report.id}</td>
// //                     <td>{report.name}</td>
// //                     <td>{report.date}</td>
// //                     <td className="text-warning fw-bold">{report.status}</td>
// //                     <td>
// //                       <button
// //                         onClick={() => handleSync(report.id)}
// //                         className="btn btn-primary btn-sm"
// //                         disabled={isSyncing}
// //                       >
// //                         Sync
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))
// //               ) : (
// //                 <tr>
// //                   <td colSpan="5" className="text-center text-muted">
// //                     No reports to be synced found.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Transfer logs */}
// //       <div>
// //         <h4 className="mb-2 fw-semibold">Transfer Logs</h4>
// //         <div className="d-flex mb-3 gap-2 flex-wrap align-items-center">
// //           <input
// //             type="text"
// //             placeholder="Search Logs..."
// //             value={searchLogs}
// //             onChange={(e) => setSearchLogs(e.target.value)}
// //             className="form-control"
// //           />
// //           <div className="d-flex gap-2 align-items-center">
// //             <label>From:</label>
// //             <input
// //               type="date"
// //               value={startDate}
// //               onChange={(e) => setStartDate(e.target.value)}
// //               className="form-control"
// //             />
// //             <label>To:</label>
// //             <input
// //               type="date"
// //               value={endDate}
// //               onChange={(e) => setEndDate(e.target.value)}
// //               className="form-control"
// //             />
// //           </div>
// //         </div>

// //         <div className="table-container">
// //           <table className="table table-striped table-bordered mb-0">
// //             <thead className="table-dark">
// //               <tr>
// //                 <th>ID</th>
// //                 <th>Report Name</th>
// //                 <th>Report Date</th>
// //                 <th>Status</th>
// //                 <th>Folder</th>
// //                 <th>Transfer Time</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {sortedLogs.length > 0 ? (
// //                 sortedLogs.map((log) => (
// //                   <tr key={log.id} className="fade-in">
// //                     <td>{log.id}</td>
// //                     <td>{log.name}</td>
// //                     <td>{log.reportDate}</td>
// //                     <td
// //                       className={
// //                         log.status === "Synced"
// //                           ? "text-success fw-bold"
// //                           : "text-danger fw-bold"
// //                       }
// //                     >
// //                       {log.status}
// //                       {log.error && <span className="ms-1" title={log.error}>❗</span>}
// //                     </td>
// //                     <td>{log.folder}</td>
// //                     <td>
// //                       {new Date(log.time).toLocaleString("en-IN", {
// //                         dateStyle: "medium",
// //                         timeStyle: "short",
// //                       })}
// //                     </td>
// //                   </tr>
// //                 ))
// //               ) : (
// //                 <tr>
// //                   <td colSpan="6" className="text-center text-muted">
// //                     No logs found for selected filters.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default OpsPage;
import React, { useState, useEffect } from "react";
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

  // Fetch pending reports on component mount
  useEffect(() => {
    fetchPendingReports();
    fetchTransferLogs();
  }, []);

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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Operations Dashboard</h2>
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
        <h4 className="mb-2 fw-semibold">Transfer Logs</h4>
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
