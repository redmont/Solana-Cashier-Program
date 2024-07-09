import { FC, useCallback, ChangeEvent, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export interface LeaderboardSearchInputProps {
  query?: string;
  onSearch?: (query: string) => void;
}

export const LeaderboardSearchInput: FC<LeaderboardSearchInputProps> = ({
  query = '',
  onSearch,
}) => {
  const [value, setValue] = useState('');

  const canClear = value != '' || !!query;

  const handleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      setValue(target.value);
    },
    [],
  );

  const handleClearClick = useCallback(() => {
    setValue('');
    query && onSearch?.('');
  }, [query, onSearch]);

  const handleSearchClick = useCallback(() => {
    onSearch?.(value);
  }, [value, onSearch]);

  return (
    <div className="leaderboard-search-input search-input-group p-inputgroup">
      <InputText
        className="query-input"
        placeholder="Search"
        value={value}
        onChange={handleChange}
      />

      <Button icon="pi pi-search" onClick={handleSearchClick} />

      {canClear && <Button icon="pi pi-times" onClick={handleClearClick} />}
    </div>
  );
};
