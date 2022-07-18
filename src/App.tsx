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

import { Box, Button } from "@mui/material";

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

interface TimetableProps {
  id: number;
  intersections: EventObject[];
}

function Timetable({ id, intersections }: TimetableProps) {
  const [globalEvents, setEvents] = useRecoilState(eventsState);
  const events = (globalEvents[id] || []).map((e: EventObject) => ({
    ...e,
    calendarId: "selection",
  }));
  const allEvents = [...events, ...intersections];

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
        setEvents((allEvents) => ({
          ...allEvents,
          [id]: [
            ...(allEvents[id] || []),
            { start: event.start, end: event.end },
          ],
        }));
        setGridSelectionElements(event.gridSelectionElements);
      }}
      events={allEvents}
    />
  );
}

function App() {
  const intersections = useRecoilValue(intersectionsState).map((s) => ({
    ...s,
    calendarId: "intersection",
  }));
  const eventsKeys = useRecoilValue(eventsKeysState);
  const setEvents = useSetRecoilState(eventsState);

  // set events adding new key
  function addNewParticipant() {
    setEvents((events) => ({
      ...events,
      [eventsKeys.length]: [],
    }));
  }

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
      {eventsKeys.map((key) => (
        <Box minWidth="300px" width="300px" key={key} padding={2}>
          <Timetable id={key} intersections={intersections} />
        </Box>
      ))}
      <Button onClick={addNewParticipant}>add new participant</Button>
    </Box>
  );
}

export default App;
