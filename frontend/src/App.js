import React, { useEffect, useState } from "react";

export const ENDPOINT = "http://127.0.0.1:8000";

function App() {
  const [events, setEvents] = useState([]);

  // Fetch all events from backend
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${ENDPOINT}/api/events/`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Calendar App</h1>
      {events}
    </div>
  );
}

export default App;
