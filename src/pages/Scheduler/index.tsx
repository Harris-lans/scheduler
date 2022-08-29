import Joyride, { CallBackProps, EVENTS } from 'react-joyride';
import { Box, Fab } from "@mui/material";
import { atom, useRecoilState } from "recoil";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Participant, { useParticipants } from "../../components/Participant";
import { Events, EventsService, Timezones } from "../../services/EventsService";
import "./index.css";
import { useCallback } from 'react';

const onboardingSteps = [
  {
    target: '.timezone-selector',
    content: 'Please select Timezone you wish to arrange your meeting in.`',
    spotlightClicks: true,
    styles: {
      options: {
        zIndex: 10000,
      }
    },
  },
  {
    target: '.timetable-container',
    content: 'Select time you wish to work in by dragging the times on the calendar. You can change your selected time by dragging it to another te slot. To delete your selected time click your selected time and click the delete',
    spotlightClicks: true,
    styles: {
      options: {
        zIndex: 10000,
      }
    },
  },
  {
    target: '.add-participant-button',
    content: 'Click Add Participant to add other meeting members.',
    spotlightClicks: true,
    styles: {
      options: {
        zIndex: 10000,
      }
    },
  },
  {
    target: '.delete-participant-button',
    content: 'Delete participant by clicking the delete button',
    spotlightClicks: true,
    styles: {
      options: {
        zIndex: 10000,
      }
    },
  },
];

// Creating required atom states with effects and default values
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

const onboardingCompleteState = atom<boolean>({ key:  "onboardingComplete" });

function Scheduler() {
  const { participants, addNewParticipant } = useParticipants();
  const [ onboardingComplete, setOnboardingComplete ] = useRecoilState(onboardingCompleteState);
  const onJoyrideCallback = useCallback((event: CallBackProps) => {
    // Checking if the tour is complete and changing onboarding complete state
    const { type } = event;

    if (type === EVENTS.TOUR_END || type === EVENTS.TOOLTIP_CLOSE) {
      setOnboardingComplete(true);
    }

  }, [setOnboardingComplete]); 

  return (
    <div id="scheduler-page" className="page">
      {
        !onboardingComplete &&
        <Joyride
          continuous
          showProgress
          showSkipButton
          steps={onboardingSteps}
          callback={onJoyrideCallback}
        />
      }
      <Box
        className="participants-container"
        display="inline-flex"
        flexDirection="row"
        width="100%"
        height="100%"
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
      <Fab
        id="add-participant-button"
        color="primary"
        aria-label="add"
        onClick={addNewParticipant}
      >
        <PersonAddIcon />
      </Fab>
    </div>
  );
}

export default Scheduler;
