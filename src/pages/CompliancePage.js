import React, { useEffect, useState } from "react";
import axios from "axios";

const CompliancePage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch available documents
  const fetchDocuments = async () => {
    try {
      const res = await axios.get("/api/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Run compliance check
  const runCompliance = async () => {
    if (!selectedDoc) {
      alert("Please select a document first.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/documents/${selectedDoc}/compliance`);
      setResult(res.data);
    } catch (err) {
      console.error("Compliance check failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compliance-container">
      <h2 className="page-title">Compliance Engine</h2>

      {/* Document Selection */}
      <div className="doc-select">
        <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
          <option value="">-- Select a Document --</option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))}
        </select>
        <button onClick={runCompliance} disabled={loading}>
          {loading ? "Checking..." : "Run Compliance Check"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="compliance-result">
          <h3>Status: {result.passed ? "✅ Passed" : "❌ Issues Found"}</h3>
          {result.issues && result.issues.length > 0 ? (
            <ul>
              {result.issues.map((issue, i) => (
                <li key={i}>⚠ {issue}</li>
              ))}
            </ul>
          ) : (
            <p>No issues detected 🎉</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
