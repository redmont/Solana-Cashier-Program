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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useMemo, useState } from 'react';
import { FileUpload } from '../FileUpload';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export const MediaUploadModal = ({
  path,
  isOpen,
  onOpen,
  onClose,
}: {
  path: string[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { authToken } = useDynamicContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiPath = useMemo(() => {
    if (path) {
      return `media-library/files?path=${path.join('/')}`;
    }
    return 'media-library/files';
  }, [path]);

  const uploadMutation = useMutation({
    mutationFn: (fileData: File) => {
      const formData = new FormData();
      formData.append('file', fileData);

      return fetch(`${baseUrl}/media-library/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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
      queryClient.invalidateQueries({
        queryKey: [apiPath],
      });
      onClose();
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
