import React, { useEffect, useState } from "react";
import { fetchSolutions } from "../Api";

function SolutionLibrary() {
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    fetchSolutions().then((res) => setSolutions(res.data));
  }, []);

  return (
    <div className="p-4 border rounded shadow">
      <h2>📚 Solution Library</h2>
      <ul>
        {solutions.map((s) => (
          <li key={s.id}>{s.name} - {s.description}</li>
        ))}
      </ul>
    </div>
  );
}

export default SolutionLibrary;
