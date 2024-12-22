/* eslint-disable @typescript-eslint/no-unused-vars */
import {useMutation, useQuery, useQueryClient,} from '@tanstack/react-query'
import { createCar, getUserCars,getAllCars,getPopularCars,getParticularCar,updateCar,deleteParticularCar,getCarsByCategory,getCarsByOptions, handleMessageSeller, getAvailableUsers } from './api'
import { carListing, objectType } from './types'

export const useCreateCar=()=>{ 
return useMutation({
mutationFn:async(payload:carListing)=>createCar(payload)
})
}

export const useUpdateCar=()=>{ 
// const queryClient=useQueryClient()
return useMutation({
mutationFn:async(payload:carListing)=>updateCar(payload)
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


export const useGetAllCars = () => {
  return useQuery({
    queryKey: ['getAllCars'],
    queryFn: async () => await getAllCars()
  });
};

export const useGetPopularCars = () => {
  return useQuery({
    queryKey: ['getPopularCars'],
    queryFn: async () => await getPopularCars()
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


export const useGetCarsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['getCarsByCategory', category],
    queryFn: async () => {
      if (!category) {
        throw new Error("category is required to fetch user cars.");
      }
      return getCarsByCategory(category); // Calls the updated `getUserCars` function
    },
    enabled: !!category, // Only enable the query if email is valid
  });
};

export const useGetCarsByOptions = (payload?: {condition:string|null, make:string|null,sellingPrice:string|number|null}) => {
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


export const useMessageSeller=()=>{
return useMutation({
mutationFn:async(payload:{user:objectType,creator:objectType})=>handleMessageSeller(payload)
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
