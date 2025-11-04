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

    if (new Date(start) > new Date(end)) {
      setError("Start time must be before or equal to end time.");
      return;
    }

    setError("");

    const startUtc = zonedTimeToUtc(new Date(start), Intl.DateTimeFormat().resolvedOptions().timeZone);
    const endUtc = zonedTimeToUtc(new Date(end), Intl.DateTimeFormat().resolvedOptions().timeZone);

    const response = await fetch(`${ENDPOINT}/api/events/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        start_time: startUtc.toISOString(),
        end_time: endUtc.toISOString(),
      }),
    });

    const data = await response.json();
    addEvent(data);

    setTitle("");
    setStart("");
    setEnd("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        required
      />
      <button type="submit">Add Event</button>
      {error && <span style={{ color: "red", marginLeft: 10 }}>{error}</span>}
    </form>
  );
}

export default EventForm;
