'use client';

import './globals.css';
import { Providers } from './providers';
import {
  Drawer,
  Flex,
  HStack,
  IconButton,
  Heading,
  DrawerContent,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { BiMenu } from 'react-icons/bi';
import { Aside } from '@/components/Aside';
import {
  AiOutlineDollarCircle,
  AiOutlineFileImage,
  AiOutlineHome,
  AiOutlineOrderedList,
  AiOutlineSetting,
  AiOutlineTrophy,
  AiOutlineUser,
} from 'react-icons/ai';
import { IoEarthOutline } from 'react-icons/io5';
import { BrandName } from '@/constants';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

const menuItems = [
  { text: 'Dashboard', icon: AiOutlineHome, path: '/' },
  { text: 'Series', icon: AiOutlineTrophy, path: '/series' },
  { text: 'Roster', icon: AiOutlineOrderedList, path: '/roster' },
  { text: 'Points', icon: AiOutlineDollarCircle, path: '/points' },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getButtonProps, isOpen, onClose } = useDisclosure();
  const buttonProps = getButtonProps();

  return (
    <html lang="en">
      <body>
        <Providers>
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
            <HStack align="start" spacing={0}>
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
                  <Aside
                    listItems={menuItems}
                    onClose={onClose}
                    isOpen={isOpen}
                  />
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
        </Providers>
      </body>
    </html>
  );
}
