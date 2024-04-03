import { Box, HStack, Image, useRadio, useRadioGroup } from "@chakra-ui/react";

const Option = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label" flex="1">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="2px"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
        }}
        px={1}
        py={1}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export const FighterSelector = ({
  fighter1,
  fighter2,
  onChange,
}: {
  fighter1: { name: string; image: string };
  fighter2: { name: string; image: string };
  onChange: (value: string) => void;
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "fighter",
    onChange: (val) => onChange(val),
  });

  const group = getRootProps();

  const radioProps = [
    getRadioProps({ value: fighter1.name }),
    getRadioProps({ value: fighter2.name }),
  ];

  return (
    <HStack {...group} justifyContent="space-between">
      <Option key={fighter1.name} {...radioProps[0]}>
        <HStack>
          <Image
            src={fighter1.image}
            alt={fighter1.name}
            width="32px"
            height="32px"
          />
          <Box>{fighter1.name}</Box>
        </HStack>
      </Option>
      <Box>vs</Box>
      <Option key={fighter2.name} {...radioProps[1]}>
        <HStack justifyContent="flex-end">
          <Box>{fighter2.name}</Box>
          <Image
            src={fighter2.image}
            alt={fighter2.name}
            width="32px"
            height="32px"
          />
        </HStack>
      </Option>
    </HStack>
  );
};
