import { Box, Card, IconButton } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TimezoneSelector from "../TimezoneSelector";
import { Events, Timezones } from "../../services/EventsService";
import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil";
import Timetable from "../TimeTable";

const eventsState = atom<Events>({ key: "events" });
const timezonesState = atom<Timezones>({ key: "timezones" });

// select events keys
const eventsKeysState = selector({
    key: "eventsKeys",
    get: ({ get }) => {
        const events = get(eventsState) as Events;
        return Object.keys(events).map(Number);
    },
});

// Returns hooks for managing participants
export function useParticipants() {
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

// Component representing each participant in the scheduling process
export default function Participant({ id }: { id: number }) {
    const { removeParticipant } = useParticipants();

    return (
        <Card variant="outlined"
            sx={{
                overflowX: "visible",
                overflowY: "scroll",
            }}>
            <Box
                width="300px"
                padding={2}
                display="flex"
                flexDirection="column"
            >
                <Box alignSelf="end">
                    <IconButton onClick={() => removeParticipant(id)}>
                        <DeleteForeverIcon color={"error"} fontSize={"large"} />
                    </IconButton>
                </Box>
                <Box pb={2}>
                    <TimezoneSelector id={id} />
                </Box>

                <Timetable id={id} />
            </Box>
        </Card>
    );
}