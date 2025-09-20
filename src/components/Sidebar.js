import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Hackathon AI Tool</h2>
      <ul className="sidebar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/upload">Ingest</Link></li>
        <li><Link to="/library">Library</Link></li>
        <li><Link to="/compliance">Compliance</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
