'use client';

import validator from '@rjsf/validator-ajv8';
import { RJSFSchema } from '@rjsf/utils';
import Form, { UiSchema } from '@rjsf/chakra-ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { baseUrl } from '@/config';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface CreateTournamentRequest {
  codeName: string;
  displayName: string;
  description: string;
  startDate: string;
  rounds: number;
  prizes: {
    title: string;
    description: string;
  }[];
}

interface UpdateTournamentRequest {
  displayName: string;
  description: string;
  startDate: string;
  rounds: number;
  prizes: {
    title: string;
    description: string;
  };
}
[];

const schema: RJSFSchema = {
  title: 'Tournament',
  type: 'object',
  required: ['displayName'],
  properties: {
    codeName: { type: 'string', title: 'Code name' },
    displayName: { type: 'string', title: 'Display name' },
    description: { type: 'string', title: 'Description' },
    startDate: { type: 'string', format: 'datetime', title: 'Start date' },
    rounds: { type: 'number', title: 'Rounds' },
    prizes: {
      type: 'array',
      title: 'Prizes',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', title: 'Title' },
          description: { type: 'string', title: 'Description' },
        },
      },
    },
  },
};

const uiSchema: UiSchema = {
  description: {
    'ui:widget': 'textarea',
  },
  prizes: {
    items: {
      description: {
        'ui:widget': 'textarea',
      },
    },
  },
};

const EditTournamentPage = ({ params }: { params: { codename: string } }) => {
  const router = useRouter();
  const toast = useToast();
  const { authToken } = useDynamicContext();
  const [formData, setFormData] = useState(null);

  const { data } = useQuery<any>({
    queryKey: [`tournaments/${params.codename}`],
  });

  const createTournamentMutation = useMutation({
    mutationFn: (data: CreateTournamentRequest) => {
      return axios.post(`${baseUrl}/tournaments`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const updateTournamentMutation = useMutation({
    mutationFn: (data: UpdateTournamentRequest) => {
      return axios.put(`${baseUrl}/series/${params.codename}`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const onSubmit = ({ formData }: any) => {
    if (params.codename === 'new') {
      createTournamentMutation.mutateAsync(formData);
      router.push('/tournaments');
    } else {
      updateTournamentMutation.mutateAsync(formData);
      toast({
        title: 'Tournament updated',
        status: 'success',
        position: 'bottom-right',
      });
    }
  };

  return (
    <>
      <Form
        formData={data}
        onChange={(e) => setFormData(e.formData)}
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default EditTournamentPage;
