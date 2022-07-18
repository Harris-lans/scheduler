import { useEffect, useState } from "react";
import logo from "./logo.svg";
import Calendar from "@toast-ui/react-calendar";

import type { EventObject, Options } from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import { Box, Button, IconButton } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import "./App.css";

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

    return mergeOverlappingIntersections(
      getIntersectionOfLists(Object.values(events).filter((e) => e.length > 0))
    );
  },
});

function useRemoveGridSelectionElements(events: any) {
  const [gridSelectionElements, setGridSelectionElements] = useState<
    HTMLElement[]
  >([]);

  useEffect(() => {
    gridSelectionElements.forEach((element: HTMLElement) => {
      // I don't know why this setTimeout is needed
      setTimeout(() => {
        element.remove();
      }, 0);
    });
  }, [gridSelectionElements, events]);

  return setGridSelectionElements;
}

function Timetable({ id }: { id: number }) {
  const { events, addNewEvent } = useEvents(id);
  const setGridSelectionElements = useRemoveGridSelectionElements(events);

  return (
    <Calendar
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
        setGridSelectionElements(event.gridSelectionElements);
      }}
      events={events}
    />
  );
}

function useParticipants() {
  const eventsKeys = useRecoilValue(eventsKeysState);
  const setEvents = useSetRecoilState(eventsState);

  function addNewParticipant() {
    setEvents((events: Events) => ({
      ...events,
      [eventsKeys.length]: [],
    }));
  }

  function removeParticipant(id: number = 0) {
    setEvents((events: Events) => {
      const newEvents = { ...events };
      delete newEvents[id];
      return newEvents;
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
  const [globalEvents, setEvents] = useRecoilState(eventsState);
  const selectedEvents = (globalEvents[id] || []).map((e: EventObject) => ({
    ...e,
    calendarId: "selection",
  }));
  const events = [...selectedEvents, ...intersections];

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
