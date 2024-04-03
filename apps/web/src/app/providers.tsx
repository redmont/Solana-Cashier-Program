"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../../theme";
import { Web3Provider } from "../components/Web3Provider";
import { AuthProvider } from "../components/AuthContextProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <AuthProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </AuthProvider>
    </Web3Provider>
  );
}
