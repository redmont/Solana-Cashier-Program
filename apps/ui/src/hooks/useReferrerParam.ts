import {
  useDynamicContext,
  useUserUpdateRequest,
} from '@dynamic-labs/sdk-react-core';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

const isClient = typeof window !== 'undefined';
const storedReferrer = isClient && localStorage.getItem('fp_ref');
const referrer =
  (isClient && new URLSearchParams(window.location.search).get('fp_ref')) ||
  null;

if (referrer && storedReferrer !== referrer) {
  localStorage.setItem('fp_ref', referrer);
}

const useReferrerParam = () => {
  const { isAuthenticated, user } = useDynamicContext();
  const { updateUser } = useUserUpdateRequest();

  const { mutate, isPending } = useMutation({
    mutationKey: ['updateUser', referrer],
    mutationFn: (referrer: string) => updateUser({ team: referrer }),
    retry: 3,
  });

  useEffect(() => {
    if (
      isAuthenticated &&
      referrer &&
      user &&
      user.team !== referrer &&
      !isPending
    ) {
      mutate(referrer);
    }
  }, [isAuthenticated, isPending, mutate, updateUser, user]);

  return user?.team;
};

export default useReferrerParam;
