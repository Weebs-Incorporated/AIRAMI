import React from 'react';
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
import { splitBitField } from '../../helpers';
import { attributesDataMap, MultiSelectValues } from './attributeSelectorUtils';
import { PostAttributes } from '../../types';

export interface MultiSelectorProps<T extends MultiSelectValues> {
    attributeName: T;
    value: PostAttributes[T];
    setValue: (newValue: PostAttributes[T]) => void;
    readonly: boolean;
}

const NonMemoizedMultiSelector = <T extends MultiSelectValues>(props: MultiSelectorProps<T>) => {
    const { attributeName, value, setValue, readonly } = props;

    const { descriptions, label, names, values } = attributesDataMap[attributeName];

    const handleChange = (e: SelectChangeEvent<PostAttributes[T][]>) => {
        e.preventDefault();

        const combinedValues =
            typeof e.target.value === 'string'
                ? parseInt(e.target.value)
                : e.target.value.reduce((prev, next) => prev | next, 0);

        setValue(combinedValues as PostAttributes[T]);
    };

    const selectedValues = splitBitField(value);

    const reverseValueMap = Object.assign({}, ...Object.keys(values).map((key) => ({ [values[key]]: key })));

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                sx={{ minWidth: 150 }}
                multiple
                name={attributeName}
                label={label}
                value={selectedValues}
                onChange={handleChange}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((e) => (
                            <Chip key={e} label={names[e] ?? reverseValueMap[e]} />
                        ))}
                    </Box>
                )}
                disabled={readonly}
            >
                {Object.keys(values).map((e) => (
                    <MenuItem value={values[e]} key={e}>
                        <Stack>
                            <span>{names[values[e] as PostAttributes[T]] ?? e}</span>
                            <Typography fontSize="smaller" color="gray" whiteSpace="normal">
                                {descriptions[values[e] as PostAttributes[T]]}
                            </Typography>
                        </Stack>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export const MultiSelector = React.memo(NonMemoizedMultiSelector);
