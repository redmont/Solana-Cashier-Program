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

const GameServerConfigs = () => {
  const { isPending, error, data } = useQuery<{
    serverConfigs: { serverId: string; streamId: string }[];
  }>({
    queryKey: ['game-server-configs'],
  });

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th></Th>
              <Th>Server ID</Th>
              <Th>Stream ID</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.serverConfigs.map((serverConfig) => (
              <Tr key={serverConfig.serverId}>
                <Td>
                  <IconButton size="sm" icon={<IoPencil />} aria-label="Edit" />
                </Td>
                <Td>{serverConfig.serverId}</Td>
                <Td>{serverConfig.streamId}</Td>
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
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GameServerConfigs;
