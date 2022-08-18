import { Box, Typography } from "@mui/material";
import { useRef } from "react";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";
import Calendar from "@toast-ui/react-calendar";
import { Events, EventsService, Timezones } from "../../services/EventsService";
import type { EventObject, ExternalEventTypes } from "@toast-ui/calendar";
import { TZDate } from "@toast-ui/calendar";

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
    // generate a random id for the event
    const eventId = Math.random().toString(36).substring(2, 15);

    setEvents((allEvents) => ({
      ...allEvents,
      [id]: [
        ...(allEvents[id] || []),
        { id: eventId, start: event.start, end: event.end },
      ],
    }));
  }

  const changeEvent: ExternalEventTypes["beforeUpdateEvent"] = ({
    event,
    changes,
  }) => {
    // TZDate is an internal object, and our algorithms use
    // the normal date object
    if (changes?.start?.constructor?.name === "TZDate") {
      changes.start = (changes.start as TZDate).toDate();
    }

    if (changes?.end?.constructor?.name === "TZDate") {
      changes.end = (changes.end as TZDate).toDate();
    }

    setEvents((allEvents) => ({
      ...allEvents,
      [id]: allEvents[id].map((e) => {
        if (e.id === event.id) {
          return {
            ...e,
            ...changes,
          };
        }

        return e;
      }),
    }));
  };

  function deleteEvent(event: EventObject) {
    setEvents((allEvents) => ({
      ...allEvents,
      [id]: allEvents[id].filter((e) => e.id !== event.id),
    }));
  }

  return {
    events,
    addNewEvent,
    changeEvent,
    deleteEvent,
  };
}

// Component that displays the selected time events and the intersection in the chosen timezone
export default function Timetable({ id }: { id: number }) {
  const timezones = useRecoilValue(timezonesState);
  const { events, addNewEvent, changeEvent, deleteEvent } = useEvents(id);
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
      useDetailPopup
      onBeforeDeleteEvent={deleteEvent}
      onBeforeUpdateEvent={changeEvent}
      events={events}
    />
  );
}
