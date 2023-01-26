import {
    Box,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Typography,
} from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { splitBitField } from '../../helpers';
import { DescMap } from './attributeDescriptionMap';

export interface MultiSelectorProps {
    value: number;
    setValue: (newValue: number) => void;
    label: string;
    optionsEnum: DescMap<number>;
    descMap: DescMap<number>;
}

const MultiSelector = (props: MultiSelectorProps) => {
    const { value, setValue, label, optionsEnum, descMap } = props;

    const handleChange = useCallback(
        (e: SelectChangeEvent<number[]>) => {
            e.preventDefault();
            if (typeof e.target.value === 'string') console.log(e.target.value);
            else {
                setValue(e.target.value.reduce((prev, next) => prev | next, 0));
            }
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

    const selectedValues = useMemo(() => splitBitField(value), [value]);

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                sx={{ minWidth: 150 }}
                multiple
                name={name}
                label={label}
                value={selectedValues}
                onChange={handleChange}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={optionsEnum[value]} />
                        ))}
                    </Box>
                )}
            >
                {menuItems}
            </Select>
        </FormControl>
    );
};

export default MultiSelector;
