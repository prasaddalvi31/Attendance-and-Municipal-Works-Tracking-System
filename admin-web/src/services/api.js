import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const fetchAuditLogs = async () => {
    // In a real app, you would pass the OAuth2 token here
    const response = await axios.get(`${API_BASE_URL}/api/logs`);
    return response.data;
};

export const generatePDFReport = (logs) => {
    const doc = new jsPDF();
    
    doc.text("Municipal Works SLA & Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["ID", "Worker ID", "Timestamp", "Latitude", "Longitude", "Status"];
    const tableRows = [];

    logs.forEach(log => {
        const status = log.anomaly_flag === 1 ? "Anomaly Detected" : "Verified";
        const logData = [
            log.id,
            log.worker_id,
            new Date(log.timestamp).toLocaleString(),
            log.lat.toFixed(4),
            log.lng.toFixed(4),
            status
        ];
        tableRows.push(logData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
    });

    doc.save("SLA_Audit_Report.pdf");
};