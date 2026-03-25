import React, { useState, useEffect } from 'react';
import MapPanel from '../components/MapPanel';
import DataTable from '../components/DataTable';
import WorksiteAssessment from '../components/WorksiteAssessment';
import { generatePDFReport } from '../services/api';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/logs');
        setLogs(response.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    // Initial load
    loadLogs();
    
    // Poll every 5 seconds for live updates
    const intervalId = setInterval(loadLogs, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>NeuraX Admin Command Center</h1>
          <p style={{ margin: 0, color: '#555' }}>Welcome, <strong>{user.name}</strong> ({user.email})</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => generatePDFReport(logs)}
            style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Download SLA Report (PDF)
          </button>
          <button 
            onClick={onLogout}
            style={{ padding: '10px 20px', backgroundColor: '#e63946', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <p>Loading real-time GIS data...</p>
      ) : (
        <>
          <WorksiteAssessment />
          <MapPanel logs={logs} />
          <DataTable logs={logs} />
        </>
      )}
    </div>
  );
};

export default Dashboard;