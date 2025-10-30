import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import image from "./farm feild.jpg"


const App = () => {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      handleUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        "https://leaf-disease-backend-j62p.onrender.com",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Prediction error:", error);
      setResult({ error: "Something went wrong. Please try again!" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
  };

  return (
    <div
      className="vh-100 d-flex flex-column justify-content-center align-items-center text-center text-white"
      style={{
       backgroundImage: `url(${image})`,
       backgroundSize: "cover",
       backgroundPosition: "center",
     }}
    >
      <div className="bg-dark bg-opacity-75 p-5 rounded-4 shadow-lg">
        <h1 className="mb-4 fw-bold text-uppercase text-warning">
          🍅 Tomato Leaf Disease Detection
        </h1>

        {!preview && (
          <div
            {...getRootProps()}
            className={`p-5 mb-4 border border-3 rounded-3 ${
              isDragActive
                ? "border-success bg-dark bg-opacity-50"
                : "border-light bg-dark bg-opacity-25"
            }`}
            style={{ cursor: "pointer", width: "400px" }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop your tomato leaf image here...</p>
            ) : (
              <p>Drag & drop an image, or click to select one</p>
            )}
          </div>
        )}

        {preview && (
          <div className="mb-3 d-flex flex-column align-items-center">
            <img
              src={preview}
              alt="preview"
              className="img-thumbnail rounded-3 shadow mb-3"
              style={{ width: "250px", height: "250px", objectFit: "cover" }}
            />
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleReset}
            >
              ✖ Close / Upload Another
            </button>
          </div>
        )}

        {loading && (
          <div className="spinner-border text-light mt-3" role="status"></div>
        )}

        {result && !result.error && (
          <div className="mt-3">
            <h4 className="text-success fw-bold">
              Disease: {result.class || result.clasee}
            </h4>
            <p className="text-light">
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </p>

            <div className="progress mt-2" style={{ height: "10px" }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${(result.confidence * 100).toFixed(2)}%` }}
              ></div>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="alert alert-danger mt-3">{result.error}</div>
        )}
      </div>
    </div>
  );
};

export default App;
