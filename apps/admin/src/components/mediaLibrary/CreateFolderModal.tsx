import { baseUrl } from '@/config';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

interface CreateFolderRequest {
  name: string;
  path?: string;
}

export const CreateFolderModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const [folderName, setFolderName] = useState('');

  const createFolderMutation = useMutation({
    mutationFn: (data: CreateFolderRequest) => {
      return axios.post(`${baseUrl}/media-library/folder`, data);
    },
  });

  const onCreate = async () => {
    await createFolderMutation.mutateAsync({
      name: folderName,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create folder</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="primary" onClick={onCreate}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
