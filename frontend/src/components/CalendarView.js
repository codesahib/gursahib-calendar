import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { ENDPOINT } from "../App";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./CalendarView.css"

const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

function CalendarView({ events, updateEvent }) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState(Views.MONTH);

    // Convert UTC times to local
    const mappedEvents = events.map((event) => ({
        ...event,
        start: utcToZonedTime(event.start_time, timezone),
        end: utcToZonedTime(event.end_time, timezone),
    }));

    const EventComponent = ({ event, view }) => {
        const timeFmt = "h:mm a";
        const startTime = format(event.start, timeFmt);
        const endTime = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZoneName: "short",
        }).format(event.end);

        if (view === "month") {
            return (
            <span>
                {event.title} <br/> {startTime}-{endTime}
            </span>
            );
        }

        return (
            <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600 }}>{event.title}</div>
            <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
                {startTime} - {endTime}
            </div>
            </div>
        );
    };


    const handleEventDrop = async ({ event, start, end }) => {
        const updatedEvent = {
        id: event.id,
        title: event.title,
        start_time: zonedTimeToUtc(start, timezone).toISOString(),
        end_time: zonedTimeToUtc(end, timezone).toISOString(),
        };

        await fetch(`${ENDPOINT}/api/events/${event.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEvent),
        });

        updateEvent(updatedEvent);
    };

    const handleEventResize = (resizeInfo) => {
        if (currentView !== "day") handleEventDrop(resizeInfo);
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
            views={["month", "week"]}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            draggableAccessor={() => true}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            popup
            components={{
            event: (props) => <EventComponent {...props} view={currentView} />,
            }}
        />
        </div>
    );
}

export default CalendarView;
