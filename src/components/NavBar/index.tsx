import { IconButton, Toolbar, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <ScheduleIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          Scheduler
        </Typography>
      </Toolbar>
    </AppBar>
  );
};