import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useRef, useState } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import Joyride from 'react-joyride';
import { TourProvider } from "@reactour/tour";
import "./index.css";

function HomePage() {
  const buttonREf = useRef<HTMLButtonElement>(null);
  const description = useRef<HTMLDivElement>(null);

  const [state, _] = useState({
    run: true,
    steps: [
      {
        target: '.description',
        content: 'This is my awesome feature!',
        spotlightClicks: true,
        styles: {
          options: {
            zIndex: 10000,
          }
        },
      },
      {
        target: '.button',
        content: 'This another awesome feature!',
        spotlightClicks: true,
        styles: {
          options: {
            zIndex: 10000,
          }
        },
      },
    ]
  })


  return (
    
    <div id="home-page" className="page">
      <div className="background">
        <CalendarMonthIcon className="icon" />
      </div>
      <div className="description">
        <Joyride
          continuous
          showProgress
          showSkipButton
          steps={state.steps}
        />
        <h2>Do you find scheduling cross timezone meetings hard?</h2>
        Well, we have a solution. We as software developers working from
        different timezones have constantly faced this issue and that is why we
        decided to solve it. Presenting <b>Scheduler</b>, a web app that allows
        you to schedule cross timezone meetings.
        <br />
        <br />
        <br />
        <Button
          className="button"
          component={Link}
          to={"/scheduler"}
          variant="contained"
          size="large"
        >
          Schedule your meeting now!
        </Button>

        
        <Button
          className="button"
          component={Link}
          to={"/tour"}
          variant="contained"
          size="large"
        >
          App Tutorial
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
