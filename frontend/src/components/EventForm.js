import React, { useState } from "react";
import { ENDPOINT } from "../App";
import { zonedTimeToUtc } from "date-fns-tz";

function EventForm({ addEvent }) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !start || !end) return;

    // Make sure user doesn’t create backwards events
    if (new Date(start) > new Date(end)) {
      setError("Start time must be before or equal to end time.");
      return;
    }

    setError("");

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startUtc = zonedTimeToUtc(new Date(start), tz);
    const endUtc = zonedTimeToUtc(new Date(end), tz);

    try {
        // Push new event to backend
        const response = await fetch(`${ENDPOINT}/api/events/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          start_time: startUtc.toISOString(),
          end_time: endUtc.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      const data = await response.json();
      addEvent(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
      return;
    }

    setTitle("");
    setStart("");
    setEnd("");
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        type="text"
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        required
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>Add</button>
      {error && <span style={errorStyle}>{error}</span>}
    </form>
  );
}

// Inline Styles
const formStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  backgroundColor: "#f9fafb",
  padding: "12px 16px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "20px",
};

const inputStyle = {
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s",
  flex: "1",
};

const buttonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 500,
  transition: "background-color 0.2s",
};

const errorStyle = {
  color: "red",
  marginLeft: "10px",
  fontSize: "0.9rem",
  fontWeight: 500,
};

// Hover feedback
buttonStyle[":hover"] = { backgroundColor: "#1d4ed8" };
inputStyle[":focus"] = { borderColor: "#2563eb" };

export default EventForm;
