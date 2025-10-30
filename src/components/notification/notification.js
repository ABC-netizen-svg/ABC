import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import opsService from '../../services/opsService';
import './notification.css';

const Notification = ({ reports, isOpen, onClose }) => {
  const { token } = useAuth();
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending reports when notification opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchPendingReports = async () => {
      try {
        const data = await opsService.getPendingReports();
        setPendingReports(data);
      } catch (error) {
        console.error('Error fetching pending reports:', error);
        // Fallback to passed reports prop
        setPendingReports(reports.filter(report => 
          report.status === 'pending' || report.status === 'Pending'
        ));
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReports();
  }, [isOpen, reports, token]);

  if (!isOpen) return null;

  return (
    <div className='notification-panel'>
      <div className='notification-header'>
        <h5>Pending Reports to Sync</h5>
        <button className='close-btn' onClick={onClose}>×</button>
      </div>
      <div className='notification-body'>
        {loading ? (
          <div className='loading-spinner'>Loading...</div>
        ) : pendingReports.length > 0 ? (
          <ul className='notification-list'>
            {pendingReports.map((report) => (
              <li key={report.id} className='notification-item'>
                <div className='notification-item-header'>
                  <span className='report-id'>#{report.id}</span>
                  <span className='report-date'>{report.date}</span>
                </div>
                <div className='report-name'>{report.name}</div>
                <span className='status-badge pending'>Needs Sync</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className='no-notifications'>
            <p>No pending reports to sync</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;