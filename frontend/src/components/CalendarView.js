import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { ENDPOINT } from "../App";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./CalendarView.css";

const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

function CalendarView({ events, updateEvent, removeEvent }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  // Convert backend UTC timestamps into the user's local timezone for display
  const mappedEvents = events.map((event) => ({
    ...event,
    start: utcToZonedTime(event.start_time, timezone),
    end: utcToZonedTime(event.end_time, timezone),
  }));

    // Handles how each event looks in the calendar
    const EventComponent = ({ event, view }) => {
        const timeFmt = "h:mm a";
        const startTime = format(event.start, timeFmt);
        const endTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZoneName: "short",
        }).format(event.end);

        return (
            <span>
            {event.title} <br /> {startTime}-{endTime}
            </span>
        );
    }


  // Called when user drags an event to a new time slot
  const handleEventDropAndResize = async ({ event, start, end }) => {
    const updatedEvent = {
      id: event.id,
      title: event.title,
      start_time: zonedTimeToUtc(start, timezone).toISOString(),
      end_time: zonedTimeToUtc(end, timezone).toISOString(),
    };

    try {
      await fetch(`${ENDPOINT}/api/events/${event.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });
    } catch (error) {
      alert("Event drop failed");
    }

    updateEvent(updatedEvent);
  };

  // Called when user deletes an event from modal
  const handleDelete = async (eventId) => {
    try {
      await fetch(`${ENDPOINT}/api/events/${eventId}/`, { method: "DELETE" });
      removeEvent(eventId);
      setSelectedEvent(null);
    } catch (error) {
      alert("Event delete failed");
    }
  };

  // Save edited start/end times for an event
  const handleSaveEdit = async () => {
    if (!editStart || !editEnd) return;
    if (new Date(editStart) > new Date(editEnd)) {
      alert("Start time must be before or equal to end time.");
      return;
    }

    const updatedEvent = {
      ...selectedEvent,
      start_time: zonedTimeToUtc(new Date(editStart), timezone).toISOString(),
      end_time: zonedTimeToUtc(new Date(editEnd), timezone).toISOString(),
    };

    try {
      await fetch(`${ENDPOINT}/api/events/${selectedEvent.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });
    } catch (error) {
      alert("Event save failed");
    }

    updateEvent(updatedEvent);
    setSelectedEvent(null);
  };

  // Opens edit modal with event details prefilled
  const openModal = (event) => {
    setSelectedEvent(event);
    setEditStart(format(utcToZonedTime(event.start_time, timezone), "yyyy-MM-dd'T'HH:mm"));
    setEditEnd(format(utcToZonedTime(event.end_time, timezone), "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <div style={{ height: 600, marginTop: 20 }}>
      <DnDCalendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: "100%" }}
        views={["month", "week", "day"]}
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        draggableAccessor={() => true}
        onEventDrop={handleEventDropAndResize}
        onEventResize={handleEventDropAndResize}
        onSelectEvent={openModal}
        popup
        components={{
          event: (props) => <EventComponent {...props} view={currentView} />,
        }}
      />

      {/* Simple modal for editing or deleting an event */}
      {selectedEvent && (
        <div style={overlayStyle} onClick={() => setSelectedEvent(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <label>
              Start:
              <input
                type="datetime-local"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                style={{ marginLeft: 10 }}
              />
            </label>
            <br />
            <label>
              End:
              <input
                type="datetime-local"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
                style={{ marginLeft: 18, marginTop: 10 }}
              />
            </label>
            <br />
            <div style={{ marginTop: 15 }}>
              <button style={btnSave} onClick={handleSaveEdit}>Save</button>
              <button style={btnClose} onClick={() => setSelectedEvent(null)}>Close</button>
              <button style={btnDelete} onClick={() => handleDelete(selectedEvent.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling for modal overlay and buttons
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 8,
  minWidth: 320,
};

const btnSave = {
  backgroundColor: "green",
  color: "white",
  padding: "5px 10px",
  border: "none",
  borderRadius: 4,
};

const btnClose = {
  marginLeft: 10,
  padding: "5px 10px",
  borderRadius: 4,
};

const btnDelete = {
  marginLeft: 10,
  backgroundColor: "red",
  color: "white",
  padding: "5px 10px",
  border: "none",
  borderRadius: 4,
};

export default CalendarView;
