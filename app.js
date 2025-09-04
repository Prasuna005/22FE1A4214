import React, { useState } from "https://cdn.skypack.dev/react";
import ReactDOM from "https://cdn.skypack.dev/react-dom";

const App = () => {
  const [urls, setUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState("shorten");
  const [originalURL, setOriginalURL] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [error, setError] = useState("");

  const generateShortCode = () => Math.random().toString(36).substring(2, 8);

  const validateURL = (url) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const addShortURL = () => {
    if (!originalURL) { setError("Enter a URL."); return; }
    if (!validateURL(originalURL)) { setError("Invalid URL."); return; }

    const shortCode = customCode || generateShortCode();
    if (urls.some(u => u.shortCode === shortCode)) {
      setError("Shortcode already exists.");
      return;
    }

    setUrls(prev => [...prev, {
      originalURL,
      shortCode,
      visits: 0,
      expiry: new Date(Date.now() + 7*24*60*60*1000)
    }]);

    setOriginalURL(""); setCustomCode(""); setError("");
    console.log(`URL Shortened: ${originalURL} -> ${shortCode}`);
  };

  const handleRedirect = (shortCode) => {
    const urlObj = urls.find(u => u.shortCode === shortCode);
    if (!urlObj) { alert("Short URL not found!"); return; }
    if (new Date() > urlObj.expiry) { alert("Short URL expired!"); return; }

    urlObj.visits += 1;
    setUrls([...urls]);
    window.open(urlObj.originalURL, "_blank");
  };

  return (
    <div className="app">
      <header>
        <h1>URL Shortener</h1>
        <button onClick={() => setCurrentPage("shorten")}>Shorten URL</button>
        <button onClick={() => setCurrentPage("stats")}>Statistics</button>
      </header>

      {currentPage === "shorten" && (
        <>
          <div className="form">
            <input
              type="text"
              placeholder="Enter URL"
              value={originalURL}
              onChange={(e) => setOriginalURL(e.target.value)}
            />
            <input
              type="text"
              placeholder="Custom shortcode (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
            <button onClick={addShortURL}>Shorten</button>
            {error && <p className="error">{error}</p>}
          </div>

          <div className="url-list">
            {urls.length === 0 && <p>No URLs yet.</p>}
            {urls.map(u => (
              <div key={u.shortCode} className="url-item">
                <p><strong>Original:</strong> {u.originalURL}</p>
                <p>
                  <strong>Short:</strong>
                  <span className="short-link" onClick={() => handleRedirect(u.shortCode)}>
                    {window.location.origin}/{u.shortCode}
                  </span>
                </p>
                <p><strong>Visits:</strong> {u.visits}</p>
                <p><strong>Expires:</strong> {u.expiry.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {currentPage === "stats" && (
        <div className="statistics">
          <h2>Statistics</h2>
          <p>Total URLs: {urls.length}</p>
          <p>Total Visits: {urls.reduce((acc,u) => acc + u.visits, 0)}</p>
          <p>
            Most Visited:
            {urls.length ? urls.reduce((a,b) => a.visits>b.visits?a:b).originalURL : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
