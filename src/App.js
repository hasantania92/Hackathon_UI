import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import LibraryPage from "./pages/LibraryPage";
import CompliancePage from "./pages/CompliancePage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
