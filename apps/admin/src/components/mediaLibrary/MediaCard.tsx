import {
  Box,
  Card,
  CardBody,
  Flex,
  Icon,
  IconButton,
  Image,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AiOutlineFolder, AiOutlineDelete } from 'react-icons/ai';

export const MediaCard = ({
  name,
  mimeType,
  thumbnailFileName,
  selected,
  onClick,
}: {
  name: string;
  mimeType: string;
  thumbnailFileName: string;
  selected: boolean;
  onClick: (name: string) => void;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (mimeType === '_FOLDER_') {
      router.push(`/media-library/${name}`);
    } else {
      onClick(name);
    }
  };

  return (
    <>
      <Card
        maxW="xs"
        onClick={handleClick}
        borderWidth="2px"
        borderColor={selected ? 'green.500' : 'transparent'}
      >
        <CardBody>
          {mimeType === '_FOLDER_' && (
            <Flex
              alignItems="center"
              justifyContent="center"
              width={36}
              height={36}
              _hover={{ cursor: 'pointer' }}
            >
              <Icon as={AiOutlineFolder} w={16} h={16} />
            </Flex>
          )}
          {thumbnailFileName && (
            <Image
              src={`http://localhost:8080/media/${thumbnailFileName}`}
              width={36}
              height={36}
              alt={name}
              borderRadius="md"
              _hover={{ cursor: 'pointer' }}
            />
          )}
          <Flex alignItems="center" justifyContent="space-between" mt="4">
            <Box>
              <Text fontSize="sm">{name}</Text>
            </Box>
            <Box>
              <IconButton
                icon={<AiOutlineDelete />}
                aria-label="Delete"
                size="xs"
              />
            </Box>
          </Flex>
        </CardBody>
      </Card>
    </>
  );
};
