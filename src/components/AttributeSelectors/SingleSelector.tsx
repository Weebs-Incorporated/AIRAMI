import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Stack, Typography, SelectChangeEvent } from '@mui/material';
import { PostAttributes } from '../../types';
import { attributesDataMap, SingleSelectValues } from './attributeSelectorUtils';

export interface SingleSelectorProps<T extends SingleSelectValues> {
    attributeName: T;
    value: PostAttributes[T];
    setValue: (newValue: PostAttributes[T]) => void;
    readonly: boolean;
}

const NonMemoizedSingleSelector = <T extends SingleSelectValues>(props: SingleSelectorProps<T>) => {
    const { attributeName, value, setValue, readonly } = props;

    const { descriptions, label, names, values } = attributesDataMap[attributeName];

    const handleChange = (e: SelectChangeEvent<PostAttributes[T]>) => {
        e.preventDefault();
        const newValue =
            typeof e.target.value === 'string' ? (parseInt(e.target.value) as PostAttributes[T]) : e.target.value;
        setValue(newValue);
    };

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select name={attributeName} label={label} value={value} onChange={handleChange} disabled={readonly}>
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

export const SingleSelector = React.memo(NonMemoizedSingleSelector);
