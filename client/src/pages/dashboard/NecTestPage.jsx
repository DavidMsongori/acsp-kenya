
import { useEffect, useState } from "react";
import api from "../../services/api";

const NecTestPage = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await api.get("/nec/applications");
        setResult(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to connect to NEC API"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <main style={{
      maxWidth: "1000px",
      margin: "40px auto",
      padding: "24px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>ACSP-Kenya NEC API Test</h1>

      {loading && <p>Checking NEC administrator access...</p>}

      {error && (
        <div style={{
          padding: "16px",
          background: "#fee2e2",
          color: "#991b1b",
          borderRadius: "8px"
        }}>
          <h3>Request failed</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div>
          <h2>API Response</h2>

          <p>
            <strong>Success:</strong>{" "}
            {String(result.success)}
          </p>

          <p>
            <strong>Applications found:</strong>{" "}
            {result.count}
          </p>

          <h3>Application Records</h3>

          {result.applications?.length === 0 && (
            <p>No applications found.</p>
          )}

          <pre style={{
            padding: "20px",
            background: "#f1f5f9",
            borderRadius: "8px",
            overflowX: "auto",
            whiteSpace: "pre-wrap"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
};

export default NecTestPage;
