import { useGetCallerUserProfile, useSaveCallerUserProfile } from './useQueries';

export function useUserProfile() {
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  return {
    userProfile,
    isLoading,
    isFetched,
    saveProfile,
  };
}
