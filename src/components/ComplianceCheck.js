import React, { useState } from "react";
import { checkCompliance } from "../Api";

function ComplianceCheck() {
  const [result, setResult] = useState(null);
  const [solutionId, setSolutionId] = useState("");

  const runCheck = async () => {
    const res = await checkCompliance(solutionId);
    setResult(res.data);
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2>✅ Compliance Engine</h2>
      <input
        type="text"
        placeholder="Enter solution ID"
        value={solutionId}
        onChange={(e) => setSolutionId(e.target.value)}
      />
      <button onClick={runCheck}>Check</button>
      {result && <p>{result.message}</p>}
    </div>
  );
}

export default ComplianceCheck;
