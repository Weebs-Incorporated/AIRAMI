import { useCallback, useMemo } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Stack, Typography, SelectChangeEvent } from '@mui/material';
import { DescMap } from './attributeDescriptionMap';

export interface SingleSelectorProps {
    value: number;
    setValue: (newValue: number) => void;
    label: string;
    optionsEnum: DescMap<number>;
    descMap: DescMap<number>;
}

export const SingleSelector = (props: SingleSelectorProps) => {
    const { value, setValue, label, optionsEnum, descMap } = props;

    const handleChange = useCallback(
        (e: SelectChangeEvent<number>) => {
            e.preventDefault();
            const newValue = typeof e.target.value === 'string' ? parseInt(e.target.value) : e.target.value;
            setValue(newValue);
        },
        [setValue],
    );

    const menuItems = useMemo(
        () =>
            (Object.values(optionsEnum).filter((e) => typeof e !== 'string') as number[]).map((e) => (
                <MenuItem value={e} key={e}>
                    <Stack>
                        <span>{optionsEnum[e]}</span>
                        <Typography fontSize="smaller" color="gray" whiteSpace="normal">
                            {descMap[e]}
                        </Typography>
                    </Stack>
                </MenuItem>
            )),
        [descMap, optionsEnum],
    );

    const name = useMemo(() => label.toLowerCase().replaceAll(/\s/g, ''), [label]);

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select name={name} label={label} value={value} onChange={handleChange}>
                {menuItems}
            </Select>
        </FormControl>
    );
};
