import {
  useHasApiCredentials,
  useSaveApiCredentials,
  useDeleteApiCredentials,
  useGetApiBotStatus,
} from './useQueries';

export function useApiCredentials() {
  const { data: hasCredentials = false, isLoading } = useHasApiCredentials();
  const { data: botStatus = [] } = useGetApiBotStatus();
  const saveCredentials = useSaveApiCredentials();
  const deleteCredentials = useDeleteApiCredentials();

  return {
    hasCredentials,
    isLoading,
    botStatus,
    saveCredentials,
    deleteCredentials,
  };
}
