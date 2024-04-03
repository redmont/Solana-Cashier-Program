"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { useAccount, useSignMessage } from "wagmi";
import { jwtDecode } from "jwt-decode";

const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

interface AuthContextValue {
  authToken: string | null;
  tokenIsValid: boolean;
  authenticate: () => Promise<string | null>;
  signOut: () => void;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  authToken: null,
  tokenIsValid: false,
  authenticate: async () => "",
  signOut: () => {},
  isAuthenticating: false,
});

export const useAuth = () => useContext(AuthContext);

const getAuthToken = async (
  walletAddress: string,
  signMessageAsync: (args?: any) => Promise<`0x${string}`>
) => {
  // Request nonce
  const nonceResponse = await fetch(`${apiUrl}/auth/get-nonce`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress }),
  });

  const { message } = await nonceResponse.json();

  // Sign nonce
  const signedMessage = await signMessageAsync({
    message,
  });

  // Request JWT with the signed nonce
  const authResponse = await fetch(`${apiUrl}/auth/get-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, message, signedMessage }),
  });

  if (authResponse.status === 403) {
    window.location.href = "/?access-denied";
    throw new Error("Unauthorised");
  }

  const { access_token } = await authResponse.json();
  window.localStorage.setItem("auth_token", access_token);
  console.log("Set auth_token", window.localStorage);
  return access_token as string;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthToken] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("auth_token");
    }
    return null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authPromise, setAuthPromise] = useState<Promise<string | null> | null>(
    null
  );

  const decodedToken = useMemo(
    () => (authToken ? jwtDecode(authToken) : null),
    [authToken]
  );

  const tokenIsValid = useMemo(() => {
    if (!decodedToken) {
      return false;
    }

    const now = Date.now() / 1000;

    return (decodedToken.exp ?? 0) > now;
  }, [decodedToken]);

  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

  const authenticate = useCallback(async (): Promise<string | null> => {
    if (!address) return null;

    if (isAuthenticating && authPromise) {
      return authPromise;
    }

    setIsAuthenticating(true);

    const promise = getAuthToken(address, signMessageAsync)
      .then((token) => {
        setAuthToken(token);
        return token;
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        return null;
      })
      .finally(() => {
        setIsAuthenticating(false);
        setAuthPromise(null); // Clear the promise after it's settled
      });

    setAuthPromise(promise);

    return promise;
  }, [address, authPromise, isAuthenticating, signMessageAsync]);

  const signOut = useCallback(() => {
    // Clear authentication token and state
    localStorage.removeItem("auth_token");
    setAuthToken(null);
  }, []);

  // The value that will be supplied to any consumers of the AuthContext
  const authContextValue = useMemo(
    () => ({
      authToken,
      tokenIsValid,
      authenticate,
      signOut,
      isAuthenticating,
    }),
    [authToken, tokenIsValid, authenticate, signOut, isAuthenticating]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
