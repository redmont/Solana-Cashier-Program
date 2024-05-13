import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FileUpload } from '../FileUpload';
import { MediaLibrary } from './MediaLibrary';
import { useState } from 'react';

export const MediaPickerModal = ({
  buttonLabel,
  onSelect,
}: {
  buttonLabel: string;
  onSelect: (path: string) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<string>();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>{buttonLabel}</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload media</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MediaLibrary
              path={null}
              onChangePath={() => {}}
              onSelect={(path) => setSelectedFile(path)}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="primary"
              onClick={() => {
                onSelect(selectedFile!);
                onClose();
              }}
            >
              Select
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
