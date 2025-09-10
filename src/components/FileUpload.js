import React, { useState } from "react";
import { uploadDocument } from "../Api";

function FileUpload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    await uploadDocument(formData);
    alert("File uploaded successfully!");
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2>📂 Upload Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default FileUpload;
