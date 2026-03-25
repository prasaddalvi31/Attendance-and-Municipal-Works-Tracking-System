import React from 'react';

const DataTable = ({ logs }) => {
  return (
    <div style={{ overflowX: 'auto', marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px' }}>Log ID</th>
            <th style={{ padding: '10px' }}>Worker ID</th>
            <th style={{ padding: '10px' }}>Time</th>
            <th style={{ padding: '10px' }}>Coordinates</th>
            <th style={{ padding: '10px' }}>ML Status</th>
            <th style={{ padding: '10px' }}>Proof Image</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: log.anomaly_flag ? '#ffe6e6' : 'white' }}>
              <td style={{ padding: '10px' }}>{log.id}</td>
              <td style={{ padding: '10px' }}>{log.worker_id}</td>
              <td style={{ padding: '10px' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td style={{ padding: '10px' }}>{log.lat != null ? log.lat.toFixed(4) : "N/A"}, {log.lng != null ? log.lng.toFixed(4) : "N/A"}</td>
              <td style={{ padding: '10px', color: log.anomaly_flag ? 'red' : 'green', fontWeight: 'bold' }}>
                {log.anomaly_flag ? 'Anomaly Flagged' : 'Verified'}
              </td>
              <td style={{ padding: '10px' }}>
                {log.photo_url ? (
                  <img 
                    src={`http://localhost:8000/${log.photo_url}`} 
                    alt="Proof" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px' }} 
                  />
                ) : (
                  <span style={{ color: '#888' }}>No Image</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;