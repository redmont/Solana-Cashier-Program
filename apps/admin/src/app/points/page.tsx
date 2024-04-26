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
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IoArrowDown, IoArrowUp, IoPencil } from 'react-icons/io5';
import { UploadBalanceChanges } from '@/components/UploadBalanceChanges';

const useDownloadBalances = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.fetchQuery({
      queryKey: ['points-balances/download', 'blob'],
    });
};

const Points = () => {
  const {
    isOpen: uploadBalancesIsOpen,
    onOpen: uploadBalancesOnOpen,
    onClose: uploadBalancesOnClose,
  } = useDisclosure();
  const downloadBalances = useDownloadBalances();

  const { isPending, error, data } = useQuery<{
    accounts: {
      accountId: string;
      primaryWalletAddress: string;
      balance: number;
    }[];
  }>({
    queryKey: ['points-balances'],
  });

  const onDownloadBalances = async () => {
    const blob: any = await downloadBalances();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'balances.csv';
      a.click();
    }
  };

  return (
    <>
      <Box>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th></Th>
                <Th>User ID</Th>
                <Th>Wallet address</Th>
                <Th>Balance</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.accounts.map((account) => (
                <Tr key={account.accountId}>
                  <Td>
                    <IconButton
                      size="sm"
                      icon={<IoPencil />}
                      aria-label="Edit"
                    />
                  </Td>
                  <Td>{account.accountId}</Td>
                  <Td>{account.primaryWalletAddress}</Td>
                  <Td>{account.balance}</Td>
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
        <HStack mt="4" gap="4" justifyContent="flex-end">
          <Button
            leftIcon={<IoArrowDown />}
            colorScheme="primary"
            variant="solid"
            onClick={onDownloadBalances}
          >
            Download balances
          </Button>
          <Button
            leftIcon={<IoArrowUp />}
            colorScheme="primary"
            variant="solid"
            onClick={uploadBalancesOnOpen}
          >
            Upload balance changes
          </Button>
        </HStack>
      </Box>

      <UploadBalanceChanges
        isOpen={uploadBalancesIsOpen}
        onClose={uploadBalancesOnClose}
      />
    </>
  );
};

export default Points;
