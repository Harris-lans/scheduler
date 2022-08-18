import { IconButton, Toolbar, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { Link } from "react-router-dom";
import LogoWhite from "../LogoWhite";
import "./index.css";

export default function NavBar() {
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
      </Toolbar>
    </AppBar>
  );
}
