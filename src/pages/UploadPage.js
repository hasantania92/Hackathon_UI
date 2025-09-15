import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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
      });
      setMessage("File uploaded successfully!");
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      console.error("Upload failed", err);
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete document "${name}"? This will also remove linked solutions.`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document");
      console.error(err);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="page-title">Upload Documents</h2>

      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {selectedFile ? <p>{selectedFile.name}</p> : <p>Drag & drop a file here, or click to select</p>}
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
                  <button onClick={() => navigate(`/compliance?docId=${doc.id}`)}>
                    Check Compliance
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(doc.id, doc.name)}
                  >
                    Delete
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
