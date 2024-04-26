import { ChangeEvent, useState } from 'react';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  List,
  Heading,
} from '@chakra-ui/react';
import { FileUpload } from './FileUpload';
import { useMutation } from '@tanstack/react-query';

interface UploadResult {
  credits: number;
  debits: number;
  errors: { walletAddress: string; amount: number; type: 'credit' | 'debit' }[];
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const UploadBalanceChanges = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (fileData: File) => {
      const formData = new FormData();
      formData.append('file', fileData);

      return fetch(`${baseUrl}/points-balances/upload`, {
        method: 'POST',
        body: formData,
      });
    },
  });

  const downloadTemplate = () => {
    const element = document.createElement('a');
    const file = new Blob(['walletAddress,amount\n'], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'balance_changes_template.csv';
    document.body.appendChild(element);
    element.click();
  };

  const onFileChange = (value: ChangeEvent<HTMLInputElement>) => {
    value.target.files && setSelectedFile(value.target.files?.[0]);
  };

  const upload = async () => {
    setUploadResult(null);

    if (!selectedFile) {
      return;
    }
    setIsLoading(true);

    try {
      const response = await uploadMutation.mutateAsync(selectedFile);
      const data = await response.json();
      setUploadResult(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload balance changes</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Button
            size="sm"
            variant="link"
            colorScheme="primary"
            onClick={downloadTemplate}
          >
            Download CSV template
          </Button>

          <Box mt="2">
            <FileUpload
              label="CSV file"
              placeholder="Select a file"
              onChange={onFileChange}
            />
          </Box>
          {uploadResult && (
            <Stack mt="4">
              <Heading size="sm">Result</Heading>

              <Box>
                Credited: <strong>{uploadResult.credits}</strong>
              </Box>
              <Box>
                Debited: <strong>{uploadResult.debits}</strong>
              </Box>
              {uploadResult.errors.length > 0 && (
                <Box>
                  <Box>Errors:</Box>
                  <List>
                    {uploadResult.errors.map((error) => (
                      <Box key={error.walletAddress}>
                        {error.walletAddress} - {error.amount} ({error.type})
                      </Box>
                    ))}
                  </List>
                </Box>
              )}
              {uploadResult.errors.length === 0 && <Box>Errors: None.</Box>}
            </Stack>
          )}
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
