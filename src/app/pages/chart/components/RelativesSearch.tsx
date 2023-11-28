import { Autocomplete, Box, TextField } from '@mui/material';
import { useRelatives } from '../hooks';
import { SyntheticEvent } from 'react';
import { RelativeForSearch } from '../models/types';

type Props = {
  onChange: (key: number | null) => void
}

export function RelativesSearch({ onChange }: Props) {
  const { getRelativesForSearch } = useRelatives();
  const relativesForSearch: RelativeForSearch[] = getRelativesForSearch()
    .sort((a: RelativeForSearch, b: RelativeForSearch) => a.label.localeCompare(b.label));

  const onAutocompleteChange = (_: SyntheticEvent, relativeForSearch: RelativeForSearch | null) => {  
    onChange(relativeForSearch?.key ?? null);
  };

  return (
    <Box component="div" sx={{ mt: 2 }}>
      <Autocomplete
        id="relatives-search"
        options={relativesForSearch}
        autoHighlight
        getOptionLabel={(relativeForSelect: RelativeForSearch) => `${relativeForSelect.label} (${relativeForSelect.key})`}
        isOptionEqualToValue={(option: RelativeForSearch, value: RelativeForSearch) => option.key === value.key}
        onChange={onAutocompleteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Родственники"
          />
        )}
      />
    </Box>
  );
}
