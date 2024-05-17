import { Box, Button, GridItem, SimpleGrid } from '@chakra-ui/react';
import Form from '@rjsf/chakra-ui';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema } from '@rjsf/utils';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { baseUrl } from '@/config';
import { dayjs } from '@/dayjs';
import { UpdateRosterRequest } from '@/app/models/updateRosterRequest';

export const Scheduler = ({
  series,
}: {
  series: {
    id: string;
    displayName: string;
    state: string | object;
  }[];
}) => {
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    schedule: false,
    series: false,
    timedSeries: false,
  });

  const { data: rosterData } = useQuery<{
    scheduleType: string;
    schedule: { codeName: string }[];
    series: { codeName: string }[];
    timedSeries: { codeName: string; startTime: string }[];
  }>({
    queryKey: ['roster'],
  });

  const timedSeries = useMemo(() => {
    return rosterData?.timedSeries.map((s: any) => ({
      codeName: s.codeName,
      startTime: dayjs(s.startTime).local().format('YYYY-MM-DDTHH:mm:ss'),
    }));
  }, [rosterData?.timedSeries]);

  const updateRosterMutation = useMutation({
    mutationFn: (data: UpdateRosterRequest) => {
      return axios.patch(`${baseUrl}/roster`, data);
    },
  });

  useEffect(() => {
    if (rosterData) {
      console.log(rosterData);
    }
  }, [rosterData]);

  const scheduleSchema: RJSFSchema = {
    title: 'Schedule',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        codeName: {
          type: 'string',
          title: 'Code name',
          oneOf: series.map((s) => ({
            const: s.id,
            title: s.displayName,
          })),
        },
      },
    },
  };

  const rotationSchema: RJSFSchema = useMemo(
    () => ({
      title: 'Rotation',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          codeName: {
            type: 'string',
            title: 'Code name',
            oneOf: series.map((s) => ({
              const: s.id,
              title: s.displayName,
            })),
          },
        },
      },
    }),
    [series],
  );

  const timedSeriesSchema: RJSFSchema = useMemo(
    () => ({
      title: 'Timed series',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          codeName: {
            type: 'string',
            title: 'Code name',
            oneOf: series.map((s) => ({
              const: s.id,
              title: s.displayName,
            })),
          },
          startTime: {
            type: 'string',
            format: 'datetime',
            title: 'Start time (local)',
          },
        },
      },
    }),
    [series],
  );

  const handleScheduleSave = async ({ formData }: any) => {
    setLoading((l) => ({ ...l, schedule: true }));

    try {
      await updateRosterMutation.mutateAsync({
        schedule: formData.map((s: any) => s.codeName),
      });
    } finally {
      setLoading((l) => ({ ...l, schedule: false }));
    }
  };

  const handleSeriesSave = async ({ formData }: any) => {
    setLoading((l) => ({ ...l, series: true }));

    try {
      await updateRosterMutation.mutateAsync({
        series: formData.map((s: any) => s.codeName),
      });
    } finally {
      setLoading((l) => ({ ...l, series: false }));
    }
  };

  const handleTimedSeriesSave = async ({ formData }: any) => {
    setLoading((l) => ({ ...l, timedSeries: true }));

    try {
      await updateRosterMutation.mutateAsync({
        timedSeries: formData.map((s: any) => ({
          codeName: s.codeName,
          startTime: dayjs(s.startTime).utc().toISOString(),
        })),
      });
    } finally {
      setLoading((l) => ({ ...l, timedSeries: false }));
      queryClient.invalidateQueries({
        queryKey: ['roster'],
      });
    }
  };

  return (
    <Box width="100%">
      <SimpleGrid columns={3} spacing={4}>
        <GridItem>
          <Form
            formData={rosterData?.schedule}
            schema={scheduleSchema}
            validator={validator}
            onSubmit={handleScheduleSave}
          >
            <Button type="submit" isLoading={loading['schedule']}>
              Save
            </Button>
          </Form>
        </GridItem>
        <GridItem>
          <Form
            formData={rosterData?.series}
            schema={rotationSchema}
            validator={validator}
            onSubmit={handleSeriesSave}
          >
            <Button type="submit" isLoading={loading['series']}>
              Save
            </Button>
          </Form>
        </GridItem>
        <GridItem>
          <Form
            formData={timedSeries}
            schema={timedSeriesSchema}
            validator={validator}
            onSubmit={handleTimedSeriesSave}
          >
            <Button type="submit" isLoading={loading['timedSeries']}>
              Save
            </Button>
          </Form>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
};
