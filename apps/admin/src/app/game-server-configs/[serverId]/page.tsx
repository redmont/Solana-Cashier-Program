'use client';

import { baseUrl } from "@/config";
import { Box, useToast } from "@chakra-ui/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Form from "@rjsf/chakra-ui";
import { RJSFSchema } from "@rjsf/utils";
import validator from '@rjsf/validator-ajv8';
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateGameServerConfigRequest {
  serverId: string;
  streamId: string;
}

interface UpdateGameServerConfigRequest {
  streamId: string;
  enabled: false;
}

const EditGameServerConfig = ({ params }: { params: { serverId: string } }) => {
  const router = useRouter();
  const toast = useToast();
  const { authToken } = useDynamicContext();
  const [, setFormData] = useState(null);

  const { data } = useQuery<any>({
    queryKey: [`game-server-configs/${params.serverId}`],
  });

  const createGameServerConfigMutation = useMutation({
    mutationFn: (data: CreateGameServerConfigRequest) => {
      return axios.post(`${baseUrl}/game-server-configs`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const updateGameServerConfigMutation = useMutation({
    mutationFn: (data: UpdateGameServerConfigRequest) => {
      return axios.patch(`${baseUrl}/game-server-configs/${params.serverId}`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    },
  });

  const schema: RJSFSchema = {
    title: 'Game server config',
    type: 'object',
    properties: {
      serverId: { type: 'string', title: 'Server ID' },
      streamId: { type: 'string', title: 'Stream ID' },
      enabled: { type: 'boolean', title: 'Enabled' },
    },
  }

  const onSubmit = ({ formData }: any) => {
    if (params.serverId === 'new') {
      createGameServerConfigMutation.mutateAsync(formData);
      toast({
        title: 'Game server config created',
        status: 'success',
        position: 'bottom-right',
      })
      router.push('/game-server-configs');
    } else {
      const { pk, sk, codeName, ...rest } = formData;
      updateGameServerConfigMutation.mutateAsync(rest);
      toast({
        title: 'Game server config updated',
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
        validator={validator}
        onSubmit={onSubmit}
      />
    </Box>
  );
}

export default EditGameServerConfig;
