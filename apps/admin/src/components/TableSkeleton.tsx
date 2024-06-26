import { Tr, Td, Skeleton } from '@chakra-ui/react';

export const TableSkeleton = ({ columns }: { columns: number }) => {
  const rows = 3;

  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Tr>
          {Array.from({ length: columns }).map((_, j) => (
            <Td>
              <Skeleton height="20px" />
            </Td>
          ))}
        </Tr>
      ))}
    </>
  );
};
