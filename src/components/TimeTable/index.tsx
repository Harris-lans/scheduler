import { Box, Typography } from "@mui/material";
import { useRef } from "react";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";
import Calendar from "@toast-ui/react-calendar";
import { Events, EventsService, Timezones } from "../../services/EventsService";
import type { EventObject } from "@toast-ui/calendar";

// Fetching global events and timezones states
const eventsState = atom<Events>({ key: "events" });
const timezonesState = atom<Timezones>({ key: "timezones" });

// Setting up intersection selector that uses the events and timezone states to calculate intersection of events
const intersectionsState = selector({
  key: "intersections",
  get: ({ get }) => {
    const events = get(eventsState);
    const timezones = get(timezonesState);
    const utcEvents = EventsService.convertEventsToUTC(events, timezones);

    return EventsService.mergeOverlappingIntersections(
      EventsService.getIntersectionOfLists(
        Object.values(utcEvents).filter((e) => e.length > 0)
      )
    );
  },
});

// Returns hooks for managing events
function useEvents(id: number = 0) {
  const intersections = useRecoilValue(intersectionsState).map((s) => ({
    ...s,
    calendarId: "intersection",
  }));

  const timezones = useRecoilValue(timezonesState);
  const intersectionsInTimezone = EventsService.convertEventObjectsFromUTC(
    intersections,
    timezones[id]
  );

  const [globalEvents, setEvents] = useRecoilState(eventsState);
  const selectedEvents = (globalEvents[id] || []).map((e: EventObject) => ({
    ...e,
    calendarId: "selection",
  }));
  const events = [...selectedEvents, ...intersectionsInTimezone];

  function addNewEvent(event: EventObject) {
    console.log(event);
    setEvents((allEvents) => ({
      ...allEvents,
      [id]: [...(allEvents[id] || []), { start: event.start, end: event.end }],
    }));
  }

  return {
    events,
    addNewEvent,
  };
}

// Component that displays the selected time events and the intersection in the chosen timezone
export default function Timetable({ id }: { id: number }) {
  const timezones = useRecoilValue(timezonesState);
  const { events, addNewEvent } = useEvents(id);
  const calendarRef = useRef(null);

  if (!timezones[id]) {
    return (
      <Box flexGrow="2">
        <Typography variant="h6">Select a timezone first.</Typography>
      </Box>
    );
  }

  return (
    <Calendar
      ref={calendarRef}
      calendars={[
        {
          id: "selection",
          name: "Selection",
          backgroundColor: "#2196F3",
          borderColor: "#2196F3",
          color: "#FFFFFF",
        },
        {
          id: "intersection",
          name: "Intersection",
          backgroundColor: "#1DE9B6",
          borderColor: "#1DE9B6",
          color: "#FFFFFF",
        },
      ]}
      usageStatistics={false}
      view="day"
      height="560px"
      week={{
        showTimezoneCollapseButton: true,
        timezonesCollapsed: true,
        eventView: ["time"],
        taskView: false,
        showNowIndicator: false,
      }}
      onSelectDateTime={(event) => {
        addNewEvent(event);

        const calendarInstance = (calendarRef.current as any).getInstance();
        calendarInstance.clearGridSelections();
      }}
      events={events}
    />
  );
}
