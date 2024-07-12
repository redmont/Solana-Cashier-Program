
'use client';

import {
  Box,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RJSFSchema } from '@rjsf/utils';

import validator from '@rjsf/validator-ajv8';
import { useState } from 'react';
import Form, { UiSchema } from '@rjsf/chakra-ui';
import axios from 'axios';
import { baseUrl } from '@/config';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const parseState = (state: string | object): any => {
  if (typeof state === 'string') {
    return state;
  }

  const firstKey = Object.keys(state)[0];

  return `${firstKey}.${parseState(Object.values(state)[0])}`;
};

const schema: RJSFSchema = {
  title: 'Daily claim amounts',
  type: 'object',
  properties: {
    dailyClaimAmounts: {
      title: ' ',
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
}

interface SetDailyClaimAmountsRequest {
  dailyClaimAmounts: number[];
}

const DailyClaimAmounts = () => {
  const [formData, setFormData] = useState(null);
  const toast = useToast();
  const { authToken } = useDynamicContext();

  const { isPending, error, data } = useQuery<{
    dailyClaimAmounts: number[]
  }>({
    queryKey: ['daily-claim-amounts'],
  });


  const setDailyClaimAmountsMutation = useMutation({
    mutationFn: (data: SetDailyClaimAmountsRequest) => {
      return axios.put(`${baseUrl}/daily-claim-amounts`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const onSubmit = ({ formData }: any) => {
    setDailyClaimAmountsMutation.mutateAsync(formData);
    toast({
      title: 'Daily claim amounts updated',
      status: 'success',
      position: 'bottom-right',
    })
  }

  return (
    <Box>
      <Form
        formData={data}
        onChange={(e) => setFormData(e.formData)}
        schema={schema}
        validator={validator}
        onSubmit={onSubmit}
      />
    </Box>
  );
}

export default DailyClaimAmounts;
