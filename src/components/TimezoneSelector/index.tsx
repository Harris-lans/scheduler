import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { rawTimeZones } from "@vvo/tzdb";
import { atom, useSetRecoilState } from "recoil";
import { Timezones } from "../../services/EventsService";

// Getting the global timezones state
const timezonesState = atom<Timezones>({key: "timezones"});

// This is a dropdown component for selecting timezones
export default function TimezoneSelector({ id }: { id: number }) {
    // Fetching set functions for the global timezone state
    const setTimezones = useSetRecoilState(timezonesState);

    return (
        <Autocomplete
            autoHighlight
            onChange={(e, value) => {
                setTimezones((timezones) => {
                    const newTimezones = { ...timezones };
                    newTimezones[id] = value?.name || "";
                    return newTimezones;
                });
            }}
            options={rawTimeZones}
            getOptionLabel={(tz) => tz.rawFormat}
            renderOption={(props, tz) => (
                <Box component="li" {...props}>
                    <Typography variant="body1">{tz.rawFormat}</Typography>
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Choose a timezone"
                    inputProps={{
                        ...params.inputProps,
                    }}
                />
            )}
        />
    );
}