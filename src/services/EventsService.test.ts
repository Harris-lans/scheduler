import type { EventObject } from "@toast-ui/calendar";
import { EventsService } from "./EventsService";

test("intersections between lists of eventobjects", () => {
  // mock list
  const list1: EventObject[] = [
    {
      start: new Date("2022-08-24T12:00:00.000Z"),
      end: new Date("2022-08-24T14:00:00.000Z"),
    },
    {
      start: new Date("2022-08-24T16:00:00.000Z"),
      end: new Date("2022-08-24T21:00:00.000Z"),
    },
    {
      start: new Date("2022-08-25T03:30:00.000Z"),
      end: new Date("2022-08-25T06:00:00.000Z"),
    },
  ];
  const list2: EventObject[] = [
    {
      start: new Date("2022-08-24T16:00:00.000Z"),
      end: new Date("2022-08-24T23:30:00.000Z"),
    },
    {
      start: new Date("2022-08-24T10:00:00.000Z"),
      end: new Date("2022-08-24T10:30:00.000Z"),
    },
    {
      start: new Date("2022-08-25T05:00:00.000Z"),
      end: new Date("2022-08-25T06:00:00.000Z"),
    },
  ];

  const intersections: EventObject[] = [
    {
      start: new Date("2022-08-24T16:00:00.000Z").getTime(),
      end: new Date("2022-08-24T21:00:00.000Z").getTime(),
    },
    {
      start: new Date("2022-08-25T05:00:00.000Z").getTime(),
      end: new Date("2022-08-25T06:00:00.000Z").getTime(),
    },
  ];

  expect(EventsService.getIntersection(list1, list2)).toEqual(intersections);
  expect(EventsService.getIntersectionOfLists([list1, list2])).toEqual(
    intersections
  );
});

test("merge overlapping intersections", () => {
  const list: EventObject[] = [
    {
      start: new Date("2022-08-24T12:00:00.000Z"),
      end: new Date("2022-08-24T14:00:00.000Z"),
    },
    {
      start: new Date("2022-08-24T13:00:00.000Z"),
      end: new Date("2022-08-24T16:00:00.000Z"),
    },
  ];

  const result: EventObject[] = [
    {
      start: new Date("2022-08-24T12:00:00.000Z").getTime(),
      end: new Date("2022-08-24T16:00:00.000Z").getTime(),
    },
  ];

  expect(EventsService.mergeOverlappingIntersections(list)).toEqual(result);
});
