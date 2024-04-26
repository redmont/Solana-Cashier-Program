import { BrandName } from '@/constants';
import {
  Box,
  HStack,
  Heading,
  IconButton,
  List,
  ListIcon,
  ListItem,
  Text,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { AiOutlineClose } from 'react-icons/ai';

type ListItem = {
  text?: string;
  icon: React.ElementType;
  path: string;
};

type AsideProps = {
  listItems: ListItem[];
  display?: {
    base: string;
    lg: string;
  };
  onClose: () => void;
  isOpen?: boolean;
};

export const Aside = ({ listItems, onClose, isOpen, ...rest }: AsideProps) => {
  return (
    <Box
      as="aside"
      borderRight="2px"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      w={{ base: '100%', lg: 60 }}
      top="0"
      pos="fixed"
      h="100%"
      minH="100vh"
      zIndex={99}
      {...rest}
    >
      <HStack p="2.5" h="10vh" justify="space-between">
        <Box width="100%" px="30px">
          <Image src="/logo.png" alt={BrandName} w="100%" />
        </Box>
        <IconButton
          onClick={onClose}
          display={isOpen ? 'flex' : 'none'}
          fontSize="18px"
          variant="ghost"
          icon={<AiOutlineClose />}
          aria-label="open menu"
        />
      </HStack>
      <Box>
        <List spacing={0} p="0.5">
          {listItems.map((item) => (
            <ListElement icon={item.icon} text={item.text} path={item.path} />
          ))}
        </List>
      </Box>
    </Box>
  );
};

const ListElement = ({ icon, text, path }: ListItem) => {
  return (
    <Link href={path}>
      <ListItem
        as={HStack}
        spacing={0}
        h="10"
        pl="2.5"
        cursor="pointer"
        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
        rounded="md"
      >
        <ListIcon boxSize={5} as={icon} />
        {text && <Text>{text}</Text>}
      </ListItem>
    </Link>
  );
};
