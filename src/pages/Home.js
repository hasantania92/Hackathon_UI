import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const cards = [
    { title: "Upload Documents", desc: "Ingest docs & visualize architecture", path: "/upload" },
    { title: "Solution Library", desc: "Search and reuse solutions", path: "/library" },
    { title: "Compliance Engine", desc: "Check against GDPR, ISO, etc.", path: "/compliance" },
  ];

  return (
    <div className="home-container">
      <h1 className="home-title">Document Management Tool</h1>
      <div className="cards-container">
        {cards.map((card, i) => (
          <Link to={card.path} className="card" key={i}>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
