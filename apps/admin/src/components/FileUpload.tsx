import { chakra } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';

interface FileUploadProps {
  label: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload = ({
  label,
  placeholder,
  onChange,
}: FileUploadProps) => {
  return (
    <FormControl isRequired>
      <FormLabel>{label}</FormLabel>
      <chakra.input
        type="file"
        w="100%"
        p="2"
        borderColor="grey.100"
        borderRadius="md"
        textColor="gray.500"
        borderWidth="1px"
        as={'input'}
        css={{
          '&::file-selector-button': {
            alignItems: 'center',
            textAlign: 'center',
            display: 'none',
            backgroundColor: 'blue.400',
            _hover: {
              backgroundColor: 'blue.500',
            },
            _active: {
              backgroundColor: 'blue.600',
            },
          },
        }}
        placeholder={placeholder}
        onChange={onChange}
      />
    </FormControl>
  );
};
