import React, { useEffect, useState } from "react";
import axios from "axios";

const LibraryPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [search, setSearch] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [recommended, setRecommended] = useState([]); // optional future use

  // Fetch solutions and docs
  const fetchSolutions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/solutions");
      setSolutions(res.data);
      setFilteredSolutions(res.data);
    } catch (err) {
      console.error("Error fetching solutions", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/documents");
      setDocuments(res.data || []);
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  useEffect(() => {
    fetchSolutions();
    fetchDocuments();
  }, []);

  // Save a solution from a selected document
  const handleSaveFromDoc = async () => {
    if (!selectedDocId) return alert("Select a document to save as a solution.");
    if (!title) return alert("Please enter a solution title.");

    try {
      const payload = {
        docId: selectedDocId,
        title,
        description,
      };
      const res = await axios.post("http://localhost:8080/api/solutions/addFromDoc", payload);
      // refresh
      setTitle("");
      setDescription("");
      setSelectedDocId("");
      fetchSolutions();

      // if backend returns some similar list in future, we could show it
      if (res.data && res.data.similar) setRecommended(res.data.similar);
      alert("Solution saved from document.");
    } catch (err) {
      console.error("Error saving solution from document", err);
      alert("Failed to save solution.");
    }
  };

  // Basic search
  const handleSearch = () => {
    setSearchTriggered(true);
    if (!search.trim()) {
      setFilteredSolutions(solutions);
      return;
    }
    const q = search.toLowerCase();
    setFilteredSolutions(
      solutions.filter(
        (s) =>
          (s.title && s.title.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.referenceDocName && s.referenceDocName.toLowerCase().includes(q))
      )
    );
  };

  return (
    <div className="library-container">
      <h2 className="page-title">Solution Library</h2>

      {/* Save as Solution (from existing uploaded document) */}
      <div className="solution-form" style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600, marginBottom: 6 }}>Save a document as a Solution</label>

        <select
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 10 }}
        >
          <option value="">-- Select uploaded document (choose approved design) --</option>
          {documents.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="title"
          placeholder="Solution Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          name="description"
          placeholder="Solution Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <button onClick={handleSaveFromDoc}>Save as Solution</button>
      </div>

      {/* Search Bar */}
      <div className="search-bar" style={{ marginBottom: 18 }}>
        <input
          type="text"
          className="search-box"
          placeholder="Search solutions (title, description, document name)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Recommended highlight (optional placeholder) */}
      {recommended.length > 0 && (
        <div style={{ border: "2px solid #38bdf8", background: "#f0f9ff", padding: 16, borderRadius: 10, marginBottom: 18 }}>
          <h3 style={{ color: "#0c4a6e" }}>🔍 Similar to your saved solution</h3>
          <div className="solutions-list">
            {recommended.map((s, idx) => (
              <div key={idx} className="solution-card">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                {s.referenceDocName && <div className="tag">{s.referenceDocName}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution List */}
      <div className="solutions-list">
        {filteredSolutions.length > 0 ? (
          filteredSolutions.map((s, idx) => (
            <div key={idx} className="solution-card">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              {s.referenceDocName && (
                <div style={{ marginTop: 8 }}>
                  <strong>Source:</strong> {s.referenceDocName}
                </div>
              )}
              {s.diagramPath && (
                <div style={{ marginTop: 8 }}>
                  <a href={s.diagramPath} target="_blank" rel="noreferrer">View Diagram</a>
                </div>
              )}
            </div>
          ))
        ) : searchTriggered ? (
          <p>No solutions found for "{search}"</p>
        ) : (
          <p>No solutions added yet.</p>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
