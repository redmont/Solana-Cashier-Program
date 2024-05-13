'use client';

import {
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  RJSFSchema,
  RegistryWidgetsType,
  WidgetProps,
} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Form, { UiSchema } from '@rjsf/chakra-ui';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Image,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '@/config';
import { MediaPickerModal } from '@/components/mediaLibrary/MediaPickerModal';

interface CreateSeriesRequest {
  codeName: string;
  displayName: string;
  betPlacementTime: number;
  fighters: {
    codeName: string;
    displayName: string;
    imagePath: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
}

interface UpdateSeriesRequest {
  displayName: string;
  betPlacementTime: number;
  fighters: {
    codeName: string;
    displayName: string;
    imagePath: string;
    model: {
      head: string;
      torso: string;
      legs: string;
    };
  }[];
  level: string;
}

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

const MediaPreviewWidget = ({ value }: WidgetProps) => {
  if (!value) {
    return null;
  }

  return (
    <FormControl>
      <FormLabel>Image</FormLabel>
      <Box w={32}>
        <Image src={value} />
      </Box>
    </FormControl>
  );
};

const MediaSelectorWidget = ({ required, value, onChange }: WidgetProps) => {
  return (
    <FormControl isRequired={required}>
      <MediaPickerModal
        buttonLabel={value ? 'Change image' : 'Select image'}
        onSelect={(path) => onChange(path)}
      />
    </FormControl>
  );
};

const widgets: RegistryWidgetsType = {
  mediaSelectorWidget: MediaSelectorWidget,
};

const uiSchema: UiSchema = {
  betPlacementTime: {
    'ui:FieldTemplate': SecondsFieldTemplate,
  },
  fighters: {
    items: {
      imageUrl: {
        'ui:widget': MediaPreviewWidget,
      },
      imagePath: {
        'ui:widget': MediaSelectorWidget,
      },
    },
  },
};

const EditSeries = ({ params }: { params: { codename: string } }) => {
  const [formData, setFormData] = useState(null);

  const { data: gameServerCapabilities } = useQuery<{
    capabilities: {
      headModels: string[];
      torsoModels: string[];
      legModels: string[];
      finishingMoves: string[];
      levels: string[];
    };
  }>({
    queryKey: ['game-server-capabilities'],
  });

  const { data } = useQuery<any>({
    queryKey: [`series/${params.codename}`],
  });

  const createSeriesMutation = useMutation({
    mutationFn: (data: CreateSeriesRequest) => {
      return axios.post(`${baseUrl}/series`, data);
    },
  });

  const updateSeriesMutation = useMutation({
    mutationFn: (data: UpdateSeriesRequest) => {
      return axios.put(`${baseUrl}/series/${params.codename}`, data);
    },
  });

  const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
    if (props.title === 'Fighter') {
      return (
        <Card>
          <CardBody>
            <Heading as="h6">{props.title}</Heading>
            <Box mb={2}>{props.description}</Box>
            {props.properties.map((element) => (
              <Box className="property-wrapper">{element.content}</Box>
            ))}
          </CardBody>
        </Card>
      );
    }

    return (
      <>
        <Heading as="h6">{props.title}</Heading>
        <Box mb={2}>{props.description}</Box>
        {props.properties.map((element) => (
          <Box className="property-wrapper">{element.content}</Box>
        ))}
      </>
    );
  };

  const schema: RJSFSchema = useMemo(
    () => ({
      title: 'Series',
      type: 'object',
      required: ['displayName'],
      properties: {
        codeName: { type: 'string', title: 'Code name' },
        displayName: { type: 'string', title: 'Display name' },
        betPlacementTime: { type: 'number', title: 'Bet placement time' },
        fighters: {
          type: 'array',
          title: 'Fighters',
          items: {
            type: 'object',
            title: 'Fighter',
            properties: {
              codeName: { type: 'string', title: 'Code name' },
              displayName: { type: 'string', title: 'Display name' },
              ticker: { type: 'string', title: 'Ticker' },
              imageUrl: { type: 'string', title: '' },
              imagePath: { type: 'string', title: 'Image' },
              model: {
                type: 'object',
                title: 'Model',
                properties: {
                  head: {
                    type: 'string',
                    title: 'Head',
                    enum: gameServerCapabilities?.capabilities.headModels,
                  },
                  torso: {
                    type: 'string',
                    title: 'Torso',
                    enum: gameServerCapabilities?.capabilities.torsoModels,
                  },
                  legs: {
                    type: 'string',
                    title: 'Legs',
                    enum: gameServerCapabilities?.capabilities.legModels,
                  },
                },
              },
            },
          },
        },
        level: {
          title: 'Level',
          enum: gameServerCapabilities?.capabilities.levels,
        },
      },
    }),
    [gameServerCapabilities],
  );

  const onSubmit = ({ formData }: any) => {
    if (params.codename === 'new') {
      createSeriesMutation.mutateAsync(formData);
    } else {
      updateSeriesMutation.mutateAsync(formData);
    }
  };

  return (
    <Box>
      <Form
        formData={data}
        onChange={(e) => setFormData(e.formData)}
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        widgets={widgets}
        templates={{ ObjectFieldTemplate }}
        onSubmit={onSubmit}
      />
    </Box>
  );
};

export default EditSeries;
