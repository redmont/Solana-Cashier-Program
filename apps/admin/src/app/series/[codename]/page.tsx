'use client';

import { FieldTemplateProps, RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Form, { UiSchema } from '@rjsf/chakra-ui';
import { Box, FormControl, HStack } from '@chakra-ui/react';

const schema: RJSFSchema = {
  title: 'Series',
  type: 'object',
  required: ['displayName'],
  properties: {
    displayName: { type: 'string', title: 'Display name' },
    betPlacementTime: { type: 'number', title: 'Bet placement time' },
    fighters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          codeName: { type: 'string', title: 'Code name' },
          displayName: { type: 'string', title: 'Display name' },
          model: {
            type: 'object',
            properties: {
              head: {
                type: 'string',
                title: 'Head',
                enum: ['H_BrawlerA', 'H_PepeA', 'H_DogeA'],
              },
              torso: {
                type: 'string',
                title: 'Torso',
                enum: ['T_BrawlerA', 'T_PepeA', 'T_DogeA'],
              },
              legs: {
                type: 'string',
                title: 'Legs',
                enum: ['L_BrawlerA', 'L_PepeA', 'L_DogeA'],
              },
            },
          },
        },
      },
    },
  },
};

const SecondsFieldTemplate = ({
  id,
  label,
  required,
  children,
}: FieldTemplateProps) => {
  return (
    <FormControl isRequired={required}>
      <HStack alignItems="flex-end">
        {children}
        <Box ml={2} mb={3}>
          seconds
        </Box>
      </HStack>
    </FormControl>
  );
};

const uiSchema: UiSchema = {
  betPlacementTime: {
    'ui:FieldTemplate': SecondsFieldTemplate,
  },
};

const EditSeries = () => {
  return (
    <Box>
      <Form schema={schema} uiSchema={uiSchema} validator={validator} />
    </Box>
  );
};

export default EditSeries;
