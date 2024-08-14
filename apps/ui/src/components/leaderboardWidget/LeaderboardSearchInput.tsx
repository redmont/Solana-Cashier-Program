import { FC, useCallback, ChangeEvent, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from '@/components/ui/button';

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
    <div className="leaderboard-search-input search-input-group p-inputgroup relative">
      <InputText
        className="query-input"
        placeholder="Search"
        value={value}
        onChange={handleChange}
      />

      {canClear && (
        <Button
          className="rounded-full hover:bg-white/10"
          onClick={handleClearClick}
        >
          <i className="pi pi-times text-text-200" />
        </Button>
      )}

      <Button className="" onClick={handleSearchClick}>
        <i className="pi pi-search text-text-200" />
      </Button>
    </div>
  );
};
