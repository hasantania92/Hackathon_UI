import React, { useEffect, useState } from "react";
import axios from "axios";
import GaugeChart from "react-gauge-chart";
import ChatBot from "../components/ChatBot"; // ✅ import ChatBot

const CompliancePage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false); // ✅ control chatbot visibility

  // Fetch available documents
  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/documents");
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
      const res = await axios.get(
        `http://localhost:8080/api/documents/${selectedDoc}/compliance`
      );
      setResult(res.data);

      // ✅ If there are issues, auto-open chatbot
      if (res.data && res.data.issues && res.data.issues.length > 0) {
        setShowChat(true);
      }

      // Fetch history as well
      const histRes = await axios.get(
        `http://localhost:8080/api/documents/${selectedDoc}/compliance/history`
      );
      setHistory(histRes.data);
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
        <select
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(e.target.value)}
        >
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                color: result.compliant ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              Status:{" "}
              {result.compliant ? "✅ Passed" : "❌ Issues Found"}
            </h3>
            <h3>Compliance Score: {result.score}/100</h3>
          </div>

          {/* Gauge Chart */}
          <div style={{ width: "500px", height: "250px", margin: "0 auto" }}>
            <GaugeChart
              id="compliance-gauge"
              nrOfLevels={20}
              percent={result.score / 100}
              textColor="#111"
              needleColor="black"
              needleBaseColor="black"
            />
          </div>

          {/* Issues */}
          {result.issues && result.issues.length > 0 && (
            <div className="issues-container">
              {result.issues.map((issue, i) => {
                let color = "#f87171"; // default red
                if (issue.includes("HIGH")) color = "#dc2626";
                else if (issue.includes("MEDIUM")) color = "#f59e0b";
                else if (issue.includes("LOW")) color = "#3b82f6";

                return (
                  <div
                    key={i}
                    className="issue-card"
                    style={{
                      borderLeft: `6px solid ${color}`,
                      background: "#fff",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#1e293b" }}>
                      ⚠ {issue}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History Table */}
      {history && history.length > 0 && (
        <div className="compliance-history" style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "15px" }}>Compliance History</h3>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Checked At</th>
                <th>Status</th>
                <th>Score</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, i) => (
                <tr key={i}>
                  <td>{new Date(entry.checkedAt).toLocaleString()}</td>
                  <td
                    style={{
                      color: entry.compliant ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {entry.compliant ? "✅ Passed" : "❌ Issues"}
                  </td>
                  <td style={{ fontWeight: "bold" }}>{entry.score}</td>
                  <td>
                    {entry.issues.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: "20px" }}>
                        {entry.issues.map((iss, j) => (
                          <li
                            key={j}
                            style={{
                              marginBottom: "4px",
                              color: "#b91c1c",
                            }}
                          >
                            ⚠ {iss}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: "green" }}>None 🎉</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ChatBot (auto-opens if issues exist) */}
      {selectedDoc && (
        <ChatBot
          selectedDoc={selectedDoc}
          complianceResult={result}
          autoOpen={showChat} // ✅ new prop
        />
      )}
    </div>
  );
};

export default CompliancePage;
