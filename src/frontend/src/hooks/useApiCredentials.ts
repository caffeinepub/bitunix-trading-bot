import { useHasApiCredentials, useSaveApiCredentials, useDeleteApiCredentials } from './useQueries';

export function useApiCredentials() {
  const { data: hasCredentials = false, isLoading } = useHasApiCredentials();
  const saveCredentials = useSaveApiCredentials();
  const deleteCredentials = useDeleteApiCredentials();

  return {
    hasCredentials,
    isLoading,
    saveCredentials,
    deleteCredentials,
  };
}
