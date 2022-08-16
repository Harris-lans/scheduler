import {
  Box,
  Fab
} from "@mui/material";
import { atom } from "recoil";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Participant, { useParticipants } from "../../components/Participant";
import { Events, EventsService, Timezones } from "../../services/EventsService";
import './index.css';

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
    <div id="scheduler-page" className="page">
      <Box
        className="participants-container"
        display="inline-flex"
        flexDirection="row"
        width="100%"
        height="89%"
        gap="3rem"
        sx={{
          overflowX: "scroll",
          overflowY: "hidden",
        }}
      >
        {participants.map((id) => (
          <Participant key={id} id={id} />
        ))}
      </Box>
      <Fab id="add-participant-button" color="primary" aria-label="add" onClick={addNewParticipant}>
        <PersonAddIcon />
      </Fab>
    </div>
  );
}

export default Scheduler;
