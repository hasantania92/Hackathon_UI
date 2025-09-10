import React, { useEffect, useState } from "react";
import axios from "axios";

const LibraryPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [newSolution, setNewSolution] = useState({ title: "", description: "", tags: "" });
  const [search, setSearch] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Fetch all solutions
  const fetchSolutions = async () => {
    try {
      const res = await axios.get("/api/solutions");
      setSolutions(res.data);
      setFilteredSolutions(res.data);
    } catch (err) {
      console.error("Error fetching solutions", err);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setNewSolution({ ...newSolution, [e.target.name]: e.target.value });
  };

  // Add new solution
  const handleAdd = async () => {
    if (!newSolution.title || !newSolution.description) return alert("Fill all fields");
    try {
      await axios.post("/api/solutions/add", newSolution);
      setNewSolution({ title: "", description: "", tags: "" });
      fetchSolutions();
    } catch (err) {
      console.error("Error adding solution", err);
    }
  };

  // Search filter (triggered by button)
  const handleSearch = () => {
    setSearchTriggered(true);
    if (!search.trim()) {
      setFilteredSolutions(solutions);
      return;
    }
    const query = search.toLowerCase();
    setFilteredSolutions(
      solutions.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          (s.tags && s.tags.toLowerCase().includes(query))
      )
    );
  };

  return (
    <div className="library-container">
      <h2 className="page-title">Solution Library</h2>

      {/* Add Solution Form */}
      <div className="solution-form">
        <input
          type="text"
          name="title"
          placeholder="Solution Title"
          value={newSolution.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Solution Description"
          value={newSolution.description}
          onChange={handleChange}
        ></textarea>
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated, e.g. Security, Cloud)"
          value={newSolution.tags}
          onChange={handleChange}
        />
        <button onClick={handleAdd}>Add Solution</button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          className="search-box"
          placeholder="Search solutions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Solution List */}
      <div className="solutions-list">
        {filteredSolutions.length > 0 ? (
          filteredSolutions.map((s, idx) => (
            <div key={idx} className="solution-card">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              {s.tags && (
                <div className="tags">
                  {s.tags.split(",").map((tag, i) => (
                    <span key={i} className="tag">
                      {tag.trim()}
                    </span>
                  ))}
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
