import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080";

const LibraryPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [search, setSearch] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [recommended, setRecommended] = useState([]);

  // Fetch solutions
  const fetchSolutions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/solutions`);
      setSolutions(res.data || []);
      setFilteredSolutions(res.data || []);
    } catch (err) {
      console.error("Error fetching solutions", err);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/documents`);
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
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        docId: selectedDocId, // backend expects "docId"
        title,
        description,
        tags: tagsArray,
      };

      const res = await axios.post(`${API_BASE}/api/solutions/addFromDoc`, payload);

      setTitle("");
      setDescription("");
      setTagsInput("");
      setSelectedDocId("");
      fetchSolutions();

      if (res.data && res.data.similar) setRecommended(res.data.similar);
      alert("Solution saved from document.");
    } catch (err) {
      console.error("Error saving solution from document", err);
      alert("Failed to save solution.");
    }
  };

  // Search
  const handleSearch = async () => {
    setSearchTriggered(true);
    const q = (search || "").trim();
    if (!q) {
      setFilteredSolutions(solutions);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/solutions/search`, {
        params: { q },
      });
      setFilteredSolutions(res.data || []);
    } catch (err) {
      console.error("Search endpoint failed, falling back to client filter", err);
      const term = q.toLowerCase();
      setFilteredSolutions(
        solutions.filter((s) => {
          const matchTitle = s.title && s.title.toLowerCase().includes(term);
          const matchDesc = s.description && s.description.toLowerCase().includes(term);
          const matchRef = s.referenceDocName && s.referenceDocName.toLowerCase().includes(term);
          const matchTags =
            s.tags && s.tags.some((t) => t && t.toLowerCase().includes(term));
          return matchTitle || matchDesc || matchRef || matchTags;
        })
      );
    }
  };

  return (
    <div className="library-container">
      <h2 className="page-title">Solution Library</h2>

      {/* Save as Solution */}
      <div className="solution-form">
        <label style={{ fontWeight: 600, marginBottom: 6 }}>
          Save a document as a Solution
        </label>

        <select
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
        >
          <option value="">
            -- Select uploaded document (choose approved design) --
          </option>
          {documents.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Solution Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Solution Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <input
          type="text"
          placeholder="Tags (comma separated; e.g. Security, Cloud)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <button onClick={handleSaveFromDoc}>Save as Solution</button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          className="search-box"
          placeholder="Search solutions (title, description, tags, source document)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Recommended highlight */}
      {recommended.length > 0 && (
        <div className="recommended-box">
          <h3>🔍 Similar to your saved solution</h3>
          <div className="solutions-list">
            {recommended.map((s, idx) => (
              <div key={idx} className="solution-card highlighted">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                {s.tags && s.tags.length > 0 && (
                  <div className="tags">
                    {s.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution List */}
      <div className="solutions-list">
        {filteredSolutions.length > 0 ? (
          filteredSolutions.map((s, idx) => (
            <div key={s.id || idx} className="solution-card">
              <h3>{s.title}</h3>
              <p>{s.description}</p>

              {s.tags && s.tags.length > 0 && (
                <div className="tags">
                  {s.tags.map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="solution-actions">
                {s.diagramPath && s.referenceDocId && (
                  <a
                    className="btn-link"
                    href={`${API_BASE}/api/documents/${s.referenceDocId}/diagram`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Diagram
                  </a>
                )}

                {s.referenceDocId && (
                  <a
                    className="btn-link"
                    href={`${API_BASE}/api/documents/${s.referenceDocId}/download`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Document
                  </a>
                )}
              </div>
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
