'use client';

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useAtom } from 'jotai';
import { activeFighterRosterWidgetRow, Fighter } from '@/store/view';
import { useFighterRosterData } from './useFighterRosterData';

const FighterRosterWidget: React.FC = () => {
  const fighters = useFighterRosterData();
  const [selectedRow, setSelectedRow] = useAtom(activeFighterRosterWidgetRow);
  const avatarTemplate = (fighter: Fighter) => {
    return (
      <img
        src={fighter.imageUrl}
        alt={fighter.displayName}
        className="w-[40px]"
      />
    );
  };

  return (
    <div className="color-text w-full rounded-md border border-border bg-foreground p-4">
      <DataTable
        value={fighters}
        className="fighter-roster-table"
        selectionMode="single"
        selection={selectedRow}
        onSelectionChange={(e) => setSelectedRow(e.value as Fighter | null)}
        emptyMessage="No fighters to show right now"
      >
        <Column body={avatarTemplate} className="color-text" />
        <Column
          field="displayName"
          header="Name"
          sortable
          className="color-text"
        />
        <Column field="fightCount" header="Fights" sortable />
        <Column field="winningFightCount" header="Win Rate" sortable />
        <Column field="wageredSum" header="Wagered Sum" sortable />
      </DataTable>
    </div>
  );
};

export default FighterRosterWidget;
