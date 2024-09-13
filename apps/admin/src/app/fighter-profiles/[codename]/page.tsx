'use client';

import { RJSFSchema, RegistryWidgetsType, WidgetProps } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Form, { UiSchema } from '@rjsf/chakra-ui';
import { Box, FormControl, FormLabel, Image, useToast } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '@/config';
import { MediaPickerModal } from '@/components/mediaLibrary/MediaPickerModal';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface CreateFighterProfileRequest {
  codeName: string;
  displayName: string;
  imagePath: string;
  model: {
    head: string;
    torso: string;
    legs: string;
  };
  ticker: string;
  tokenAddress: string;
  tokenChainId: string;
  enabled: boolean;
}

interface UpdateFighterProfileRequest {
  codeName: string;
  displayName: string;
  imagePath: string;
  model: {
    head: string;
    torso: string;
    legs: string;
  };
  ticker: string;
  tokenAddress: string;
  tokenChainId: string;
  enabled: boolean;
}

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

const MediaSelectorWidget = ({
  label,
  required,
  value,
  onChange,
}: WidgetProps) => {
  return (
    <FormControl isRequired={required}>
      <MediaPickerModal
        buttonLabel={value ? `Change ${label}` : `Select ${label}`}
        onSelect={(path) => onChange(path)}
      />
    </FormControl>
  );
};

const widgets: RegistryWidgetsType = {
  mediaSelectorWidget: MediaSelectorWidget,
};

const uiSchema: UiSchema = {
  imageUrl: {
    'ui:widget': MediaPreviewWidget,
  },
  imagePath: {
    'ui:widget': MediaSelectorWidget,
  },
};

const EditFighterProfile = ({ params }: { params: { codename: string } }) => {
  const router = useRouter();
  const toast = useToast();
  const { authToken } = useDynamicContext();
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

  const torsoModels = useMemo(() => {
    if (gameServerCapabilities?.capabilities?.torsoModels) {
      return ['', ...gameServerCapabilities.capabilities.torsoModels];
    }

    return [''];
  }, [gameServerCapabilities]);

  const legModels = useMemo(() => {
    if (gameServerCapabilities?.capabilities?.legModels) {
      return ['', ...gameServerCapabilities.capabilities.legModels];
    }
  }, [gameServerCapabilities]);

  const { data } = useQuery<any>({
    queryKey: [`fighter-profiles/${params.codename}`],
  });

  const createFighterProfileMutation = useMutation({
    mutationFn: (data: CreateFighterProfileRequest) => {
      return axios.post(`${baseUrl}/fighter-profiles`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const updateFighterProfileMutation = useMutation({
    mutationFn: (data: UpdateFighterProfileRequest) => {
      return axios.put(`${baseUrl}/fighter-profiles/${params.codename}`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const schema: RJSFSchema = useMemo(
    () => ({
      title: 'Fighter profile',
      type: 'object',
      properties: {
        codeName: { type: 'string', title: 'Code name' },
        displayName: { type: 'string', title: 'Display name' },
        ticker: { type: 'string', title: 'Ticker' },
        tokenAddress: { type: 'string', title: 'Token address' },
        tokenChainId: { type: 'string', title: 'Token chain ID (CAIP-2)' },
        imageUrl: { type: 'string', title: '' },
        imagePath: { type: 'string', title: 'Image' },
        enabled: { type: 'boolean', title: 'Enabled' },
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
              enum: torsoModels,
            },
            legs: {
              type: 'string',
              title: 'Legs',
              enum: legModels,
            },
          },
        },
      },
    }),
    [gameServerCapabilities],
  );

  const onSubmit = ({ formData }: any) => {
    if (params.codename === 'new') {
      createFighterProfileMutation.mutateAsync(formData);
      toast({
        title: 'Fighter profile created',
        status: 'success',
        position: 'bottom-right',
      });
      router.push('/fighter-profiles');
    } else {
      const { pk, sk, codeName, ...rest } = formData;
      updateFighterProfileMutation.mutateAsync(rest);
      toast({
        title: 'Fighter profile updated',
        status: 'success',
        position: 'bottom-right',
      });
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
        onSubmit={onSubmit}
      />
    </Box>
  );
};

export default EditFighterProfile;
