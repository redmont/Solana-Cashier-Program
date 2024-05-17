'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSignMessage } from 'wagmi';
import { jwtDecode } from 'jwt-decode';

import { serverUrl } from '@/config';
import { ManualPromise } from '@/utils';
import { useEthWallet } from '@/hooks';

const AUTH_TOKEN_STORAGE_KEY = 'authToken';

interface AuthContextValue {
  isAuthenticated: boolean;
  authToken: string | null;
  signOut: () => void;
  authenticate: () => Promise<string | null>;
  waitAuthReady: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  authToken: null,
  signOut: () => {},
  authenticate: () => Promise.resolve(null),
  waitAuthReady: () => Promise.resolve(null),
});

interface GetNonceResponse {
  message: string;
  error: {
    message: string;
  };
}

interface GetTokenResponse {
  access_token: string;
  error: {
    message: string;
  };
}

export function getCurrentAuthToken() {
  return localStorage?.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export const AuthProvider: FC<PropsWithChildren> = (props) => {
  const { address: walletAddress, isReady: isWalletReady } = useEthWallet();

  const { signMessageAsync } = useSignMessage();
  const [authToken, setAuthToken] = useState<string | null>(null);

  const { setAuthReady, waitAuthReady } = useMemo(() => {
    const promise = new ManualPromise<string | null>();

    return {
      setAuthReady: (token: string | null) => promise.resolve(token),
      waitAuthReady: () => (walletAddress ? promise : Promise.resolve(null)),
    };
  }, [walletAddress]);

  const verifyToken = useCallback((token: string) => {
    if (!token) return false;

    const decodedToken = jwtDecode(token);

    if (!decodedToken) return false;

    const now = Date.now() / 1000;

    return (decodedToken.exp ?? 0) > now;
  }, []);

  const getToken = useCallback(
    async (address: string) => {
      const nonceResp = await fetch(`${serverUrl}/auth/get-nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      const { message, error: nonceError }: GetNonceResponse =
        await nonceResp.json();

      if (nonceResp.status > 200) {
        throw new Error(nonceError.message);
      }

      let signedMessage;

      try {
        signedMessage = await signMessageAsync({ message });
      } catch (err) {
        return null;
      }

      const tokenResp = await fetch(`${serverUrl}/auth/get-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          message,
          signedMessage,
        }),
      });

      const { access_token, error: tokenError }: GetTokenResponse =
        await tokenResp.json();

      if (nonceResp.status > 200) {
        throw new Error(tokenError.message);
      }

      return access_token;
    },
    [signMessageAsync],
  );

  const authenticate = useMemo(() => {
    let promise: ManualPromise<string | null>;

    return async () => {
      let token: string | null = null;

      if (promise) return promise;

      promise = new ManualPromise<string | null>();

      try {
        if (walletAddress) {
          token = await getToken(walletAddress);
        } else return null;

        if (token === null) {
          return promise.resolve(null);
        }

        setAuthToken(token);
        localStorage?.setItem(AUTH_TOKEN_STORAGE_KEY, token);

        return promise.resolve(token);
      } catch (err) {
        console.error(err);
      }

      return promise.resolve(null);
    };
  }, [walletAddress, getToken]);

  const signOut = useCallback(() => {
    localStorage?.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAuthToken(null);
  }, []);

  useEffect(() => {
    if (isWalletReady && !walletAddress) {
      signOut();
      setAuthReady(null);

      return;
    }

    const savedToken = getCurrentAuthToken();
    const isSavedTokenValid = verifyToken(savedToken ?? '');

    if (isSavedTokenValid) {
      setAuthToken(savedToken);
      setAuthReady(savedToken);

      return;
    }

    if (savedToken && !isSavedTokenValid) {
      localStorage?.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }

    authenticate()
      .then((token) => {
        if (!token) {
          signOut();
        } else {
          setAuthReady(token);
        }
      })
      .catch((err) => console.error(err));
  }, [
    walletAddress,
    isWalletReady,
    authenticate,
    verifyToken,
    signOut,
    setAuthReady,
  ]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!authToken,
        authToken,
        waitAuthReady,
        authenticate,
        signOut,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
