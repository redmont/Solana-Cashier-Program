'use client';

import {
  Box,
  IconButton,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { IoPencil } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

const parseState = (state: string | object): any => {
  if (typeof state === 'string') {
    return state;
  }

  const firstKey = Object.keys(state)[0];

  return `${firstKey}.${parseState(Object.values(state)[0])}`;
};

const Series = () => {
  const router = useRouter();

  const { isPending, error, data } = useQuery<{
    series: { id: string; displayName: string; state: string | object }[];
  }>({
    queryKey: ['series'],
  });

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Name</Th>
              <Th>Code name</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.series.map((series) => (
              <Tr key={series.id}>
                <Td>
                  <IconButton
                    size="sm"
                    icon={<IoPencil />}
                    aria-label="Edit"
                    onClick={() => router.push(`/series/${series.id}`)}
                  />
                </Td>
                <Td>{series.displayName}</Td>
                <Td>{series.id}</Td>
                <Td>{parseState(series.state)}</Td>
              </Tr>
            ))}
            {isPending && (
              <Tr>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
                <Td>
                  <Skeleton height="20px" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Series;
