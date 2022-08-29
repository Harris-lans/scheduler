import { IconButton, Toolbar, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { Link, useLocation } from "react-router-dom";
import LogoWhite from "../LogoWhite";
import HelpIcon from '@mui/icons-material/Help';
import "./index.css";
import { atom, useSetRecoilState } from "recoil";

const onboardingCompleteState = atom<boolean>({ key:  "onboardingComplete" });

export default function NavBar() {
  const location = useLocation();
  const setOnboardingComplete = useSetRecoilState(onboardingCompleteState);

  return (
    <AppBar position="static">
      <Toolbar variant="dense" id="nav-bar">
        <IconButton
          component={Link}
          to={"/"}
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <LogoWhite />
        </IconButton>
        <Typography color="inherit" component="div">
          Scheduler
        </Typography>
        <div className="button-container">
          {
            location.pathname === '/scheduler' &&
            <IconButton onClick={() => setOnboardingComplete(false)}>
              <HelpIcon fontSize="large" style={{ color: '#fff' }}/>
            </IconButton>
          }
        </div>
      </Toolbar>
    </AppBar>
  );
}
