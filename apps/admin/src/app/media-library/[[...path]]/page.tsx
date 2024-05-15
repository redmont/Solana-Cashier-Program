'use client';

import { CreateFolderModal } from '@/components/mediaLibrary/CreateFolderModal';
import { MediaLibrary } from '@/components/mediaLibrary/MediaLibrary';
import { MediaUploadModal } from '@/components/mediaLibrary/MediaUploadModal';
import { Button, ButtonGroup, Stack, useDisclosure } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AiOutlineFileAdd, AiOutlineFolderAdd } from 'react-icons/ai';

const MediaLibraryPage = ({ params }: { params: { path: string[] } }) => {
  const router = useRouter();

  const {
    isOpen: uploadIsOpen,
    onOpen: uploadOnOpen,
    onClose: uploadOnClose,
  } = useDisclosure();

  const {
    isOpen: createFolderIsOpen,
    onOpen: createFolderOnOpen,
    onClose: createFolderOnClose,
  } = useDisclosure();

  const handleChangePath = (path: string) => {
    router.push(`/media-library${path}`);
  };

  return (
    <>
      <Stack>
        <ButtonGroup spacing="4" mb="10">
          <Button leftIcon={<AiOutlineFileAdd />} onClick={uploadOnOpen}>
            Upload file
          </Button>
          <Button
            leftIcon={<AiOutlineFolderAdd />}
            onClick={createFolderOnOpen}
          >
            Create folder
          </Button>
        </ButtonGroup>
        <MediaLibrary path={params.path} onChangePath={handleChangePath} />
      </Stack>
      <MediaUploadModal
        path={params.path}
        isOpen={uploadIsOpen}
        onOpen={uploadOnOpen}
        onClose={uploadOnClose}
      />
      <CreateFolderModal
        isOpen={createFolderIsOpen}
        onOpen={createFolderOnOpen}
        onClose={createFolderOnClose}
      />
    </>
  );
};

export default MediaLibraryPage;
