import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch uploaded docs
  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/documents"); // ✅ full URL
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle file select
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      setMessage("");
      await axios.post("http://localhost:8080/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }); // ✅ full URL
      setMessage("File uploaded successfully!");
      setSelectedFile(null);
      fetchDocuments(); // refresh list
    } catch (err) {
      console.error("Upload failed", err);
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="page-title">Upload Documents</h2>

      {/* Dropzone */}
      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {selectedFile ? (
          <p>{selectedFile.name}</p>
        ) : (
          <p>Drag & drop a file here, or click to select</p>
        )}
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <button onClick={handleUpload} disabled={uploading} className="upload-btn">
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="upload-message">{message}</p>}

      <h3 className="section-title">Uploaded Documents</h3>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Uploaded At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() =>
                      window.open(`http://localhost:8080/api/documents/${doc.id}/diagram`, "_blank")
                    }
                  >
                    View Diagram
                  </button>
                  <button
                    onClick={async () => {
                      const res = await axios.get(
                        `http://localhost:8080/api/documents/${doc.id}/compliance`
                      );
                      alert(JSON.stringify(res.data, null, 2));
                    }}
                  >
                    Check Compliance
                  </button>
                  <button
                    onClick={async () => {
                      const q = prompt("Ask something about this document:");
                      if (!q) return;
                      const res = await axios.get(
                        `http://localhost:8080/api/documents/${doc.id}/chat`,
                        { params: { q } }
                      );
                      alert(res.data);
                    }}
                  >
                    Ask AI
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No documents uploaded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UploadPage;
