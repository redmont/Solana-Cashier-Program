'use client';

import {
  Box,
  Button,
  HStack,
  IconButton,
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
import { TableSkeleton } from '@/components/TableSkeleton';

const parseState = (state: string | object): any => {
  if (typeof state === 'string') {
    return state;
  }

  const firstKey = Object.keys(state)[0];

  return `${firstKey}.${parseState(Object.values(state)[0])}`;
};

const FighterProfiles = () => {
  const router = useRouter();

  const { isPending, error, data } = useQuery<{
    fighterProfiles: {
      displayName: string;
      codeName: string;
      model: { head: string };
    }[];
  }>({
    queryKey: ['fighter-profiles'],
  });

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Name</Th>
              <Th>Head model</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.fighterProfiles.map((fighterProfile, i) => (
              <Tr key={i}>
                <Td>
                  <IconButton
                    size="sm"
                    icon={<IoPencil />}
                    aria-label="Edit"
                    onClick={() =>
                      router.push(
                        `/fighter-profiles/${fighterProfile.codeName}`,
                      )
                    }
                  />
                </Td>
                <Td>{fighterProfile.displayName}</Td>
                <Td>{fighterProfile.model.head}</Td>
              </Tr>
            ))}
            {isPending && <TableSkeleton columns={2} />}
          </Tbody>
        </Table>
      </TableContainer>
      <HStack justifyContent="flex-end" mt="4">
        <Button onClick={() => router.push('/fighter-profiles/new')}>
          Create fighter profile
        </Button>
      </HStack>
    </Box>
  );
};

export default FighterProfiles;
