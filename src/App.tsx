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
} from "recoil";

import { Box } from "@mui/material";

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

const eventsState = atom({
  key: "events",
  default: {} as Record<string, EventObject[]>,
  effects: [
    ({ onSet, setSelf }) => {
      onSet((events) => {
        const mergedEvents = {} as Record<string, EventObject[]>;
        Object.keys(events).forEach((key) => {
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

const intersectionsState = selector({
  key: "intersections",
  get: ({ get }) => {
    const events = get(eventsState);

    return mergeOverlappingIntersections(
      getIntersection(events["a"] || [], events["b"] || [])
    );
  },
});

interface CProps {
  id: string;
  intersections: EventObject[];
}

function C({ id, intersections }: CProps) {
  const [globalEvents, setEvents] = useRecoilState(eventsState);
  const events = (globalEvents[id] || []).map((e: EventObject) => ({
    ...e,
    calendarId: "selection",
  }));
  const allEvents = [...events, ...intersections];

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
        event.gridSelectionElements.forEach((element: HTMLElement) => {
          // I don't know why this setTimeout is needed
          setTimeout(() => {
            element.remove();
          }, 0);
        });
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
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div style={{ flexGrow: 1 }}>
        <C intersections={intersections} id="a" />
      </div>
      <div style={{ flexGrow: 1 }}>
        <C intersections={intersections} id="b" />
      </div>
    </div>
  );
}

export default App;
