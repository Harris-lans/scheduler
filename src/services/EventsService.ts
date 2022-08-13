import type { EventObject } from "@toast-ui/calendar";
import { rawTimeZones } from "@vvo/tzdb";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

export type Events = { [key: number]: EventObject[] };
export type Timezones = { [key: number]: string };

export class EventsService {
    static getIntersection(
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

    static getIntersectionOfLists(lists: EventObject[][]): EventObject[] {
        let result = lists[0] || [];
        for (const list of lists) {
            result = EventsService.getIntersection(result, list);
        }
        return result;
    }

    static mergeOverlappingIntersections(
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

    static convertEventObjectsToUTC(
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

    static convertEventsToUTC(events: Events, timezones: Timezones) {
        const result: Events = {};
        Object.keys(events)
            .map(Number)
            .forEach((key) => {
                result[key] = EventsService.convertEventObjectsToUTC(events[key], timezones[key]);
            });
        return result;
    }

    static convertEventObjectsFromUTC(
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
}