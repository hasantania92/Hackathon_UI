import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const cards = [
    { title: "Ingest Documents", desc: "Upload design documents and auto-generate architecture diagrams with AI", path: "/upload" },
    { title: "Library", desc: "Browse and reuse solutions and architecture patterns", path: "/library" },
    { title: "Compliance", desc: "Run AI-powered compliance checks on your design documents with instant feedback", path: "/compliance" },
  ];

  return (
    <div className="home-container">
      <h1 className="home-title">ArchAIve</h1>
      <p className="home-tagline">
        AI-powered hub to ingest, visualize, store and validate your system designs.
      </p>
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
