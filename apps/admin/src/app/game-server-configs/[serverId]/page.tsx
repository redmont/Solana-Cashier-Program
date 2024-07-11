'use client';

import { useToast } from "@chakra-ui/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { useState } from "react";


const EditGameServerConfig = ({ params }: { params: { serverId: string } }) => {
  const router = useRouter();
  const toast = useToast();
  const { authToken } = useDynamicContext();
  const [formData, setFormData] = useState(null);

  return (<></>);
}

export default EditGameServerConfig;
