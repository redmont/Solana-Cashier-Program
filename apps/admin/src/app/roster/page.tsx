'use client';

import React, { useEffect, useState } from 'react';

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
import { UpdateRosterRequest } from '../models/updateRosterRequest';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const Roster = () => {
  const [scheduleType, setScheduleType] = useState('');

  const { data } = useQuery<{
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

  const handleSave = async () => {
    await updateRosterMutation.mutateAsync({
      scheduleType,
    });
  };

  return (
    <Stack gap="10" alignItems="flex-start" width="100%">
      <Box>
        <Heading as="h1">Roster</Heading>
        <FormControl mt="4">
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
        <FormControl mt="4">
          <Button onClick={handleSave}>Save</Button>
        </FormControl>
      </Box>
      <Scheduler series={data?.series ?? []} />
    </Stack>
  );
};

export default Roster;
