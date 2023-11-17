import { Autocomplete, TextField } from '@mui/material';
import { RelationshipService } from '../services';
import { IRelativeNode } from '../models/interfaces';
import { SyntheticEvent } from 'react';

type Props = {
  onChange: (selectedKey: number) => void
}

export function RelativeSearch({ onChange }: Props) {
  const relationshipService: RelationshipService = new RelationshipService();
  // TODO: вернуть без иниуиалов, а их делать только при рендере
  const relativesForSelect: Pick<IRelativeNode, 'key' | 'initials'>[] = relationshipService
    .getRelativesForSelect()
    .sort((a: Pick<IRelativeNode, 'key' | 'initials'>, b: Pick<IRelativeNode, 'key' | 'initials'>) => a.initials.localeCompare(b.initials));

  const onSearchChange = (event: SyntheticEvent<Element>, newValue: Pick<IRelativeNode, 'key' | 'initials'> | string) => {
    console.warn(newValue);
  }

  return (
    <Autocomplete
      freeSolo
      id="free-solo-2-demo"
      disableClearable
      options={relativesForSelect}
      onChange={onSearchChange}
      getOptionLabel={(relative: Pick<IRelativeNode, 'key' | 'initials'> | string) => (relative as Pick<IRelativeNode, 'key' | 'initials'>).initials}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.key}>
            {option.initials}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Начните вводить"
          InputProps={{
            ...params.InputProps,
            type: 'search',
          }}
        />
      )}
    />
  )
}

