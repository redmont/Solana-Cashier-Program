'use client';

import {
  Box,
  Button,
  HStack,
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
import { useRouter } from 'next/navigation';
import { IoPencil } from 'react-icons/io5';

const TournamentsPage = () => {
  const router = useRouter();

  const { isPending, error, data } = useQuery<{
    tournaments: {
      codeName: string;
      displayName: string;
      startDate: string;
      endDate: string;
    }[];
  }>({
    queryKey: ['tournaments'],
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
              <Th>Start date</Th>
              <Th>End date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.tournaments.map((tournament) => (
              <Tr key={tournament.codeName}>
                <Td>
                  <IconButton
                    size="sm"
                    icon={<IoPencil />}
                    aria-label="Edit"
                    onClick={() =>
                      router.push(`/tournaments/${tournament.codeName}`)
                    }
                  />
                </Td>
                <Td>{tournament.displayName}</Td>
                <Td>{tournament.codeName}</Td>
                <Td>{tournament.startDate}</Td>
                <Td>{tournament.endDate}</Td>
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
                <Td>
                  <Skeleton height="20px" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <HStack justifyContent="flex-end" mt="4">
        <Button onClick={() => router.push('/tournaments/new')}>
          Create tournament
        </Button>
      </HStack>
    </Box>
  );
};

export default TournamentsPage;
