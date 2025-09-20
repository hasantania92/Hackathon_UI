import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [editingDoc, setEditingDoc] = useState(null); // doc currently in draw.io editor
  const iframeRef = useRef(null);
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

  const openDiagramEditor = async (doc) => {
    try {
      // Fetch XML from backend
      const res = await axios.get(`http://localhost:8080/api/documents/${doc.id}/diagramXml`);
      let xml = res.data;

      // ✅ Wrap XML if only <mxGraphModel> provided
      if (!xml.trim().startsWith("<mxfile")) {
        xml = `<mxfile host="app.diagrams.net"><diagram name="Page-1">${xml}</diagram></mxfile>`;
      }

      setEditingDoc({ ...doc, xml });
    } catch (err) {
      alert("Failed to load diagram XML");
      console.error(err);
    }
  };

  // Listen for messages from draw.io iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      if (!event.data) return;
      const msg = event.data;

      if (msg.event === "save" && editingDoc) {
        try {
          await axios.post(
            `http://localhost:8080/api/documents/${editingDoc.id}/diagramXml/save`,
            msg.xml,
            { headers: { "Content-Type": "application/xml" } }
          );
          alert("Diagram saved successfully!");
          setEditingDoc(null);
        } catch (err) {
          alert("Failed to save diagram");
          console.error(err);
        }
      } else if (msg.event === "exit") {
        setEditingDoc(null);
      } else if (msg.event === "init" && editingDoc && iframeRef.current) {
        // ✅ Encode XML to base64
        const b64 = btoa(unescape(encodeURIComponent(editingDoc.xml)));

        // Send both raw XML and base64 (draw.io accepts either)
        iframeRef.current.contentWindow.postMessage(
          {
            action: "load",
            xml: editingDoc.xml,
            xmlb64: b64,
          },
          "*"
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [editingDoc]);

  return (
    <div className="upload-container">
      <h2 className="page-title">Upload Documents</h2>

      {/* Upload Area */}
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
                  <button onClick={() => openDiagramEditor(doc)}>Edit Diagram</button>
                  <button onClick={() => navigate(`/compliance?docId=${doc.id}`)}>Check Compliance</button>
                  <button className="delete-btn" onClick={() => handleDelete(doc.id, doc.name)}>
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

      {/* Embedded Draw.io Editor */}
      {editingDoc && (
        <div className="diagram-editor-modal">
          <iframe
            ref={iframeRef}
            title="Draw.io Editor"
            src={`https://embed.diagrams.net/?embed=1&ui=min&proto=json&spin=0&saveAndExit=1&noExitBtn=0`}
            width="100%"
            height="600"
            frameBorder="0"
            style={{ border: "1px solid #ccc" }}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
