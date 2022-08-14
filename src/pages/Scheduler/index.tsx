import {
  Box,
  Button,
} from "@mui/material";
import { atom } from "recoil";
import NavBar from "../../components/NavBar";
import Participant, { useParticipants } from "../../components/Participant";
import { Events, EventsService, Timezones } from "../../services/EventsService";

// creating required atom states with effects and default values
atom({
  key: "events",
  default: { 0: [] } as Events,
  effects: [
      ({ onSet, setSelf }) => {
          onSet((events) => {
              const mergedEvents = {} as Events;
              Object.keys(events)
                  .map(Number)
                  .forEach((key) => {
                      mergedEvents[key] = EventsService.mergeOverlappingIntersections(
                          // merge twice because there might be overlapping intersections after the first merge
                          EventsService.mergeOverlappingIntersections(events[key])
                      );
                  });

              setSelf(mergedEvents);
          });
      },
  ],
});

atom({
  key: "timezones",
  default: { 0: "" } as Timezones,
});

function Scheduler() {
  const { participants, addNewParticipant } = useParticipants();

  return (
    <div>
      <NavBar/>
      <div className="page">
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
          <Button onClick={addNewParticipant}>Add new participant</Button>
        </Box>
      </div>
    </div>
  );
}

export default Scheduler;
