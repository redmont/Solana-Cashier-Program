'use client';

import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Scheduler } from '@/components/Scheduler';
import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

interface UpdateRosterRequest {
  series: string[];
  scheduleType: string;
}

const Roster = () => {
  const [scheduleType, setScheduleType] = useState('');
  const [newSchedule, setNewSchedule] = useState<string[]>([]);

  const { isPending, error, data } = useQuery<{
    series: { id: string; displayName: string; state: string | object }[];
  }>({
    queryKey: ['series'],
  });

  const { data: rosterData } = useQuery<{
    series: { codeName: string }[];
    scheduleType: string;
  }>({
    queryKey: ['roster'],
  });

  const currentSchedule = useMemo(() => {
    if (!rosterData) {
      return [];
    }

    return rosterData.series.map(({ codeName }) => {
      const s = data?.series.find((s) => s.id === codeName);
      return s
        ? { id: s.id, displayName: s.displayName }
        : { id: codeName, displayName: codeName };
    });
  }, [data, rosterData]);

  const updateRosterMutation = useMutation({
    mutationFn: (data: UpdateRosterRequest) => {
      return axios.put(`${baseUrl}/roster`, data);
    },
  });

  useEffect(() => {
    if (rosterData) {
      setScheduleType(rosterData.scheduleType);
    }
  }, [rosterData]);

  const handleNewSchedule = (newSchedule: string[]) => {
    setNewSchedule(newSchedule);
  };

  const handleSave = async () => {
    await updateRosterMutation.mutateAsync({
      series: newSchedule,
      scheduleType,
    });
  };

  return (
    <Stack gap="10" alignItems="flex-start">
      <Box>
        <Heading as="h1">Roster</Heading>
        <FormControl>
          <FormLabel>Schedule type</FormLabel>
          <Stack>
            <RadioGroup
              value={scheduleType}
              onChange={(val) => setScheduleType(val)}
            >
              <Stack>
                <Radio value="linear">Linear</Radio>
                <Radio value="random">Random</Radio>
              </Stack>
            </RadioGroup>
          </Stack>
        </FormControl>
      </Box>
      <Scheduler
        series={data?.series ?? []}
        schedule={currentSchedule}
        onNewSchedule={handleNewSchedule}
      />
      <Button onClick={handleSave}>Save</Button>
    </Stack>
  );
};

export default Roster;
