import { baseUrl } from '@/config';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';
import { FileUpload } from '../FileUpload';

export const MediaUploadModal = ({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (fileData: File) => {
      const formData = new FormData();
      formData.append('file', fileData);

      return fetch(`${baseUrl}/media-library/upload`, {
        method: 'POST',
        body: formData,
      });
    },
  });

  const onFileChange = (value: ChangeEvent<HTMLInputElement>) => {
    value.target.files && setSelectedFile(value.target.files?.[0]);
  };

  const upload = async () => {
    if (!selectedFile) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await uploadMutation.mutateAsync(selectedFile);
      const data = await response.json();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload media</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FileUpload
            label="Media file"
            placeholder="Select a file"
            onChange={onFileChange}
          />
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="primary" onClick={upload} isLoading={isLoading}>
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
