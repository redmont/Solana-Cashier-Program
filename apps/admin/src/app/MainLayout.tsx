import {
  Flex,
  HStack,
  IconButton,
  Heading,
  Drawer,
  DrawerContent,
  useColorModeValue,
  useDisclosure,
  Center,
} from '@chakra-ui/react';
import { BiMenu } from 'react-icons/bi';
import { Aside } from '@/components/Aside';
import {
  AiOutlineCrown,
  AiOutlineDollar,
  AiOutlineDollarCircle,
  AiOutlineFileImage,
  AiOutlineHome,
  AiOutlineOrderedList,
  AiOutlineSetting,
  AiOutlineTrophy,
  AiOutlineUser,
} from 'react-icons/ai';
import { BrandName } from '@/constants';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useSession } from 'next-auth/react';

const menuItems = [
  { text: 'Dashboard', icon: AiOutlineHome, path: '/' },
  { text: 'Tournaments', icon: AiOutlineTrophy, path: '/tournaments' },
  {
    text: 'Fighter profiles',
    icon: AiOutlineUser,
    path: '/fighter-profiles',
  },
  { text: 'Series', icon: AiOutlineCrown, path: '/series' },
  { text: 'Roster', icon: AiOutlineOrderedList, path: '/roster' },
  { text: 'Points', icon: AiOutlineDollarCircle, path: '/points' },
  { text: 'Daily claim amounts', icon: AiOutlineDollar, path: '/daily-claim-amounts' },
  {
    text: 'Game server configs',
    icon: AiOutlineSetting,
    path: '/game-server-configs',
  },
  {
    text: 'Media library',
    icon: AiOutlineFileImage,
    path: '/media-library',
  },
];

export const MainLayout = ({ children }: any) => {
  const { getButtonProps, isOpen, onClose } = useDisclosure();
  const buttonProps = getButtonProps();
  const session = useSession();

  if (!session.data?.user) {
    return (
      <Center height="100vh" bgImage="/bg.png">
        <DynamicWidget />
      </Center>
    );
  }

  return (
    <>
      <Flex
        as="nav"
        alignItems="center"
        justifyContent={{ base: 'space-between', lg: 'flex-end' }}
        h="10vh"
        p="2.5"
      >
        <HStack spacing={2} display={{ base: 'flex', lg: 'none' }}>
          <IconButton
            {...buttonProps}
            fontSize="18px"
            variant="ghost"
            icon={<BiMenu />}
            aria-label="open menu"
          />
          <Heading as="h1" size="md">
            {BrandName}
          </Heading>
        </HStack>
        <HStack spacing="1">
          <DynamicWidget />
        </HStack>
      </Flex>
      <HStack align="start" spacing={0} width="100%">
        <Aside
          listItems={menuItems}
          onClose={onClose}
          display={{ base: 'none', lg: 'block' }}
        />
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="xs"
        >
          <DrawerContent>
            <Aside listItems={menuItems} onClose={onClose} isOpen={isOpen} />
          </DrawerContent>
        </Drawer>
        <Flex
          as="main"
          ml={{ base: 0, lg: '60' }}
          p="4"
          w="full"
          minH="90vh"
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          {children}
        </Flex>
      </HStack>
    </>
  );
};
