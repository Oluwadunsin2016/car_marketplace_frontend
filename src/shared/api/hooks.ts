/* eslint-disable @typescript-eslint/no-unused-vars */
import {useInfiniteQuery, useMutation, useQuery, useQueryClient,} from '@tanstack/react-query'
import { CarSearchParams, createCar, getUserCars,getAllCars,getPopularCars,getParticularCar,updateCar,deleteParticularCar,getCarsByCategory,getCarsByOptions, handleMessageSeller, getAvailableUsers, getPublicUserProfile, getSavedCars, PaginationParams, saveCar, syncCurrentUser, unsaveCar, updateCurrentUserProfile, getConversations, openDirectConversation, getMessages, sendMessage, markConversationRead, deleteMessage, toggleMessageReaction, toggleMessagePin, editMessage, forwardMessage } from './api'
import { MarketplaceUserProfilePayload, objectType } from '@/shared/types/marketplace'

export const useCreateCar=()=>{ 
const queryClient=useQueryClient()
return useMutation({
mutationFn:async(payload:FormData)=>createCar(payload),
onSuccess:()=>{
queryClient.invalidateQueries({ queryKey: ['getUserCars'] });
queryClient.invalidateQueries({ queryKey: ['getAllCars'] });
queryClient.invalidateQueries({ queryKey: ['infiniteCarsByOptions'] });
queryClient.invalidateQueries({ queryKey: ['infiniteCarsByCategory'] });
}
})
}

export const useUpdateCar=()=>{ 
const queryClient=useQueryClient()
return useMutation({
mutationFn:async(payload:FormData)=>updateCar(payload),
onSuccess:()=>{
queryClient.invalidateQueries({ queryKey: ['getUserCars'] });
queryClient.invalidateQueries({ queryKey: ['getParticularCars'] });
queryClient.invalidateQueries({ queryKey: ['getAllCars'] });
queryClient.invalidateQueries({ queryKey: ['infiniteCarsByOptions'] });
queryClient.invalidateQueries({ queryKey: ['infiniteCarsByCategory'] });
queryClient.invalidateQueries({ queryKey: ['publicMarketplaceProfile'] });
queryClient.invalidateQueries({ queryKey: ['savedCars'] });
}
})
}

export const useGetUserCars = (email?: string) => {
  return useQuery({
    queryKey: ['getUserCars', email],
    queryFn: async () => {
      if (!email) {
        throw new Error("Email is required to fetch user cars.");
      }
      return getUserCars(email); // Calls the updated `getUserCars` function
    },
    enabled: !!email, // Only enable the query if email is valid
  });
};


export const useGetAllCars = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['getAllCars', params],
    queryFn: async () => await getAllCars(params)
  });
};

export const useGetPopularCars = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['getPopularCars', params],
    queryFn: async () => await getPopularCars(params)
  });
};

export const useGetParticularCar = (id?: number|string) => {
  return useQuery({
    queryKey: ['getParticularCars', id],
    queryFn: async () => {
      if (!id) {
        throw new Error("id is required to fetch user cars.");
      }
      return getParticularCar(id); // Calls the updated `getUserCars` function
    },
    enabled: !!id, // Only enable the query if email is valid
  });
};

export const useDeleteParticularCar = () => {
const queryClient=useQueryClient()
  return useMutation({
    mutationFn: async ({id}: {id?:number|string}) => await deleteParticularCar(id||''),
    onSuccess:(_,variables: { id?: string | number; email: string })=>{
    const {email}=variables
    queryClient.invalidateQueries({queryKey:['getUserCars', email]})
    }
  });
};


export const useGetCarsByCategory = (category?: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['getCarsByCategory', category, params],
    queryFn: async () => {
      if (!category) {
        throw new Error("category is required to fetch user cars.");
      }
      return getCarsByCategory(category, params); // Calls the updated `getUserCars` function
    },
    enabled: !!category, // Only enable the query if email is valid
  });
};

export const useGetCarsByOptions = (payload?: CarSearchParams & PaginationParams) => {
  return useQuery({
    queryKey: ['getCarsByCategory', payload],
    queryFn: async () => {
      if (!payload) {
        throw new Error("payload is required to fetch user cars.");
      }
      return getCarsByOptions(payload); // Calls the updated `getUserCars` function
    },
    enabled: !!payload, // Only enable the query if email is valid
  });
};

export const useInfiniteCarsByCategory = (category?: string, limit = 12, filters?: CarSearchParams) => {
  return useInfiniteQuery({
    queryKey: ['infiniteCarsByCategory', category, limit, filters],
    queryFn: async ({ pageParam }) => {
      if (!category) {
        throw new Error("category is required to fetch cars.");
      }
      return getCarsByCategory(category, { ...filters, page: pageParam, limit });
    },
    enabled: !!category,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  });
};

export const useInfiniteCarsByOptions = (
  payload?: CarSearchParams,
  limit = 12
) => {
  return useInfiniteQuery({
    queryKey: ['infiniteCarsByOptions', payload, limit],
    queryFn: async ({ pageParam }) => {
      if (!payload) {
        throw new Error("payload is required to fetch cars.");
      }
      return getCarsByOptions({ ...payload, page: pageParam, limit });
    },
    enabled: !!payload,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  });
};


export const useMessageSeller=()=>{
return useMutation({
mutationFn:async(payload:{user?:objectType,creator:objectType})=>handleMessageSeller(payload)
})
}


export const useGetAvailableUsers = (userId?: string) => {
  return useQuery({
    queryKey: ['getAvailableUsers', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("userId is required to fetch user cars.");
      }
      return getAvailableUsers(userId);
    },
    enabled: !!userId,
  });
};

export const useSyncCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: ['currentMarketplaceUser'],
    queryFn: syncCurrentUser,
    enabled,
  });
};

export const useGetPublicUserProfile = (profileId?: string | number) => {
  return useQuery({
    queryKey: ['publicMarketplaceProfile', profileId],
    queryFn: async () => getPublicUserProfile(profileId || ''),
    enabled: Boolean(profileId),
  });
};

export const useUpdateCurrentUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MarketplaceUserProfilePayload | FormData) => updateCurrentUserProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentMarketplaceUser'] });
      queryClient.invalidateQueries({ queryKey: ['getUserCars'] });
      queryClient.invalidateQueries({ queryKey: ['publicMarketplaceProfile'] });
    },
  });
};

export const useGetSavedCars = (enabled = true) => {
  return useQuery({
    queryKey: ['savedCars'],
    queryFn: getSavedCars,
    enabled,
  });
};

export const useSaveCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carId: string | number) => saveCar(carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCars'] });
    },
  });
};

export const useUnsaveCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carId: string | number) => unsaveCar(carId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCars'] });
    },
  });
};

export const useGetConversations = (enabled = true) => {
  return useQuery({
    queryKey: ['chatConversations'],
    queryFn: getConversations,
    enabled,
    refetchInterval: 5000,
  });
};

export const useOpenDirectConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openDirectConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useGetMessages = (conversationId?: string) => {
  return useQuery({
    queryKey: ['chatMessages', conversationId],
    queryFn: async () => getMessages(conversationId || ''),
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? 3000 : false,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, payload }: { conversationId: string; payload: FormData }) => sendMessage(conversationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useEditChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, text }: { messageId: string; text: string }) => editMessage(messageId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useForwardChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, privateUserIds }: { messageId: string; privateUserIds: Array<number | string> }) =>
      forwardMessage(messageId, privateUserIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useToggleMessageReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => toggleMessageReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};

export const useToggleMessagePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleMessagePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
    },
  });
};
