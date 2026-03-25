import React, { useState } from 'react';
import axios from 'axios';

const WorksiteAssessment = () => {
  const [file, setFile] = useState(null);
  const [lat, setLat] = useState('15.8929');
  const [lng, setLng] = useState('73.8224');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAssess = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a photo of the worksite.");
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('lat', parseFloat(lat));
    formData.append('lng', parseFloat(lng));
    formData.append('photo', file);

    try {
      const res = await axios.post('http://localhost:8000/api/assess-worksite', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError("Failed to reach AI assessment server. Ensure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '15px' }}>AI Worksite Assessment</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Upload an incident photo from a scout to instantly estimate the repair crew size required.</p>
      
      <form onSubmit={handleAssess} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Latitude</label>
          <input 
            type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} 
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} required 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Longitude</label>
          <input 
            type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} 
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} required 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Incident Photo</label>
          <input 
            type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} 
            style={{ padding: '5px' }} required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', height: '37px' }}
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {result.photo_url && (
            <img 
              src={`http://localhost:8000/${result.photo_url}`} 
              alt="Analyzed Worksite" 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }} 
            />
          )}
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#065f46' }}>Assessment Complete</h3>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#047857' }}>
              Estimated Crew Required: <span style={{ fontSize: '24px', backgroundColor: '#10b981', color: 'white', padding: '2px 10px', borderRadius: '5px', marginLeft: '5px' }}>{result.estimated_workers} personnel</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksiteAssessment;
