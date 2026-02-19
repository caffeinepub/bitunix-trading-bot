import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BotConfig, OrderRequest, TradeRecord, UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetBotConfigs() {
  const { actor, isFetching } = useActor();

  return useQuery<BotConfig[]>({
    queryKey: ['botConfigs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBotConfigs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBotConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: BotConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveBotConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botConfigs'] });
    },
  });
}

export function useUpdateBotConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ index, config }: { index: bigint; config: BotConfig }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBotConfig(index, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botConfigs'] });
    },
  });
}

export function useDeleteBotConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBotConfig(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botConfigs'] });
    },
  });
}

export function useGetTradingHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<TradeRecord[]>({
    queryKey: ['tradingHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTradingHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: OrderRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useGetBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasApiCredentials() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasApiCredentials'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasApiCredentials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveApiCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ apiKey, apiSecret }: { apiKey: string; apiSecret: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveApiCredentials(apiKey, apiSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasApiCredentials'] });
    },
  });
}

export function useDeleteApiCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteApiCredentials();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasApiCredentials'] });
    },
  });
}
