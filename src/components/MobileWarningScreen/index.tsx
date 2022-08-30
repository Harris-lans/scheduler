import MobileOffIcon from '@mui/icons-material/MobileOff';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { Typography } from '@mui/material';
import './index.css';

export default function MobileWarningScreen() {
    return (
        <div className="fullscreen-popup mobile-warning-screen">
            <SentimentVeryDissatisfiedIcon className='sad-icon' />
            <h2 className='title'>
                Sorry for the inconvenience 
            </h2>
            <Typography className='message' textAlign={"justify"} fontSize="1.2rem">
                We currently do not support mobile browsers. While we are working hard on optimizing the application for mobile browsers, please feel free to use our application on desktop and laptop browsers.
            </Typography>
            <MobileOffIcon className='no-mobile-icon' />
        </div>
    );
}