import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import "./index.css";

function HomePage() {
  return (
    
    <div id="home-page" className="page">
      <div className="background">
        <CalendarMonthIcon className="icon" />
      </div>
      <div className="description">
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
      </div>
    </div>
  );
}

export default HomePage;
