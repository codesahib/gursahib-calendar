import React, { useEffect, useState } from "react";
import EventForm from "./components/EventForm";

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

  // Add a new event
  const addEvent = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  // Update event (drag or modal edit)
  const updateEvent = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  };

  // Remove event after deletion
  const removeEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Calendar App</h1>
      <EventForm addEvent={addEvent} />
    </div>
  );
}

export default App;
