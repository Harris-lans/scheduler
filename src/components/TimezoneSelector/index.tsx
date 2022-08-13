import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { rawTimeZones } from "@vvo/tzdb";
import { atom, useSetRecoilState } from "recoil";
import { Timezones } from "../../services/EventsService";

const timezonesState = atom<Timezones>({key: "timezones"});

export default function TimezoneSelector({ id }: { id: number }) {
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