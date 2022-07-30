import { useRef } from "react";
import Calendar from "@toast-ui/react-calendar";

import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

import type { EventObject } from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import {
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import { rawTimeZones } from "@vvo/tzdb";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

function getIntersection(
  list1: EventObject[],
  list2: EventObject[]
): EventObject[] {
  const result: EventObject[] = [];
  for (const item1 of list1) {
    for (const item2 of list2) {
      if (item1.start < item2.end && item1.end > item2.start) {
        result.push({
          start: Math.max(item1.start, item2.start),
          end: Math.min(item1.end, item2.end),
        });
      }
    }
  }
  return result;
}

function getIntersectionOfLists(lists: EventObject[][]): EventObject[] {
  let result = lists[0] || [];
  for (const list of lists) {
    result = getIntersection(result, list);
  }
  return result;
}

function mergeOverlappingIntersections(
  intersections: EventObject[]
): EventObject[] {
  const result: EventObject[] = [];
  for (const intersection of intersections) {
    let absorbed = false;
    for (const item of result) {
      if (intersection.start <= item.end && intersection.end >= item.start) {
        item.start = Math.min(item.start, intersection.start);
        item.end = Math.max(item.end, intersection.end);
        absorbed = true;
      }
    }
    if (!absorbed) {
      result.push({ ...intersection });
    }
  }
  return result;
}

type Events = { [key: number]: EventObject[] };
const eventsState = atom({
  key: "events",
  default: { 0: [] } as Events,
  effects: [
    ({ onSet, setSelf }) => {
      onSet((events) => {
        const mergedEvents = {} as Events;
        Object.keys(events)
          .map(Number)
          .forEach((key) => {
            mergedEvents[key] = mergeOverlappingIntersections(
              // merge twice because there might be overlapping intersections after the first merge
              mergeOverlappingIntersections(events[key])
            );
          });

        setSelf(mergedEvents);
      });
    },
  ],
});

type Timezones = { [key: number]: string };
const timezonesState = atom({
  key: "timezones",
  default: { 0: "" } as Timezones,
});

function convertEventObjectsToUTC(
  list: EventObject[],
  timezone: typeof rawTimeZones[number]["name"]
) {
  return list.map((item) => {
    return {
      ...item,
      start: zonedTimeToUtc(item.start, timezone),
      end: zonedTimeToUtc(item.end, timezone),
    };
  });
}

function convertEventsToUTC(events: Events, timezones: Timezones) {
  const result: Events = {};
  Object.keys(events)
    .map(Number)
    .forEach((key) => {
      result[key] = convertEventObjectsToUTC(events[key], timezones[key]);
    });
  return result;
}

function convertEventObjectsFromUTC(
  list: EventObject[],
  timezone: typeof rawTimeZones[number]["name"]
) {
  return list.map((item) => {
    return {
      ...item,
      start: utcToZonedTime(item.start, timezone),
      end: utcToZonedTime(item.end, timezone),
    };
  });
}

// select events keys
const eventsKeysState = selector({
  key: "eventsKeys",
  get: ({ get }) => {
    const events = get(eventsState) as Events;
    return Object.keys(events).map(Number);
  },
});

const intersectionsState = selector({
  key: "intersections",
  get: ({ get }) => {
    const events = get(eventsState);
    const timezones = get(timezonesState);
    const utcEvents = convertEventsToUTC(events, timezones);

    return mergeOverlappingIntersections(
      getIntersectionOfLists(
        Object.values(utcEvents).filter((e) => e.length > 0)
      )
    );
  },
});

function Timetable({ id }: { id: number }) {
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
          backgroundColor: "#23CE6B",
          borderColor: "#23CE6B",
        },
        {
          id: "intersection",
          name: "Intersection",
          backgroundColor: "#00a9ff",
          borderColor: "#00a9ff",
        },
      ]}
      usageStatistics={false}
      view="day"
      week={{
        showTimezoneCollapseButton: true,
        timezonesCollapsed: true,
        eventView: ["time"],
        taskView: false,
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

function useParticipants() {
  const eventsKeys = useRecoilValue(eventsKeysState);
  const setEvents = useSetRecoilState(eventsState);
  const setTimezones = useSetRecoilState(timezonesState);

  function addNewParticipant() {
    setEvents((events: Events) => ({
      ...events,
      [(eventsKeys?.at(-1) ?? 0) + 1]: [],
    }));
  }

  function removeParticipant(id: number = 0) {
    setEvents((events: Events) => {
      const newEvents = { ...events };
      delete newEvents[id];
      return newEvents;
    });
    setTimezones((timezones) => {
      const newTimezones = { ...timezones };
      delete newTimezones[id];
      return newTimezones;
    });
  }

  return {
    addNewParticipant,
    removeParticipant,
    participants: eventsKeys,
  };
}

function useEvents(id: number = 0) {
  const intersections = useRecoilValue(intersectionsState).map((s) => ({
    ...s,
    calendarId: "intersection",
  }));

  const timezones = useRecoilValue(timezonesState);
  const intersectionsInTimezone = convertEventObjectsFromUTC(
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

function TimezoneSelector({ id }: { id: number }) {
  const setTimezones = useSetRecoilState(timezonesState);

  return (
    <Autocomplete
      autoHighlight
      onChange={(e, value) => {
        setTimezones((timezones) => {
          const newTimezones = { ...timezones };
          newTimezones[id] = value?.name || "";
          return newTimezones;
        });
      }}
      options={rawTimeZones}
      getOptionLabel={(tz) => tz.rawFormat}
      renderOption={(props, tz) => (
        <Box component="li" {...props}>
          <Typography variant="body1">{tz.rawFormat}</Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a timezone"
          inputProps={{
            ...params.inputProps,
          }}
        />
      )}
    />
  );
}

function Participant({ id }: { id: number }) {
  const { removeParticipant } = useParticipants();

  return (
    <Box
      minWidth="300px"
      width="300px"
      padding={2}
      display="flex"
      flexDirection="column"
    >
      <Box alignSelf="end">
        <IconButton onClick={() => removeParticipant(id)}>
          <DeleteForeverIcon />
        </IconButton>
      </Box>
      <Box pb={2}>
        <TimezoneSelector id={id} />
      </Box>

      <Timetable id={id} />
    </Box>
  );
}

function App() {
  const { participants, addNewParticipant } = useParticipants();

  return (
    <Box
      display="flex"
      flexDirection="row"
      width="100%"
      sx={{
        overflowX: "scroll",
        overflowY: "hidden",
      }}
    >
      {participants.map((id) => (
        <Participant key={id} id={id} />
      ))}
      <Button onClick={addNewParticipant}>add new participant</Button>
    </Box>
  );
}

export default App;
