import axiosInstance from "@/shared/api/client";
import { ChatConversation, ChatMessage, MarketplaceUserProfilePayload, objectType } from "@/shared/types/marketplace";

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type CarSearchParams = {
  category?: string | null;
  condition?: string | null;
  fuelType?: string | null;
  make?: string | null;
  maxMileage?: string | number | null;
  maxPrice?: string | number | null;
  maxYear?: string | number | null;
  minPrice?: string | number | null;
  minYear?: string | number | null;
  sellingPrice?: string | number | null;
  sort?: string | null;
  transmission?: string | null;
};

export const createCar=async(payload:FormData)=>{
try{
const response= await axiosInstance.post('/car/create',payload)
return response
}catch(error){
    console.error("Error creating car:", error);
    throw error;
}
}
export const updateCar=async(payload:FormData)=>{
try{
const response= await axiosInstance.put('/car/update',payload)
return response
}catch(error){
    console.error("Error updating car:", error);
    throw error;
}
}


export const getUserCars = async (userEmail: string) => {
  try {
    const response = await axiosInstance.get(`/car/user-cars/${userEmail}`);
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching user cars:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getAllCars = async (params?: PaginationParams) => {
  try {
    const response = await axiosInstance.get('/car/all-cars',{params});
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getPopularCars = async (params?: PaginationParams) => {
  try {
    const response = await axiosInstance.get('/car/popular-cars',{params});
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};

export const getParticularCar = async (id: number|string) => {
  try {
    const response = await axiosInstance.get(`/car/particular-car/${id}`);
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching this car:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const deleteParticularCar = async (id: number|string) => {
  try {
    const response = await axiosInstance.delete(`/car/delete/${id}`);
    return response.data; 
  } catch (error) {
    console.error("Error deleting this car:", error);
    throw error; 
  }
};


export const getCarsByCategory = async (category: string, params?: CarSearchParams & PaginationParams) => {
  try {
    const response = await axiosInstance.get(`/car/cars/${category}`,{params});
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars for this category:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getCarsByOptions = async (payload: CarSearchParams & PaginationParams) => {
  try {
    const response = await axiosInstance.get(`/car/options`,{params:payload});
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars for the provided options:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getAvailableUsers = async (userId:string|number) => {
  try {
   const response= await axiosInstance.get(`/user/getAvailableUsers?currentUserId=${userId}`)
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const getPublicUserProfile = async (profileId: string | number) => {
  const response = await axiosInstance.get(`/user/profile/${profileId}`);
  return response.data;
};

export const getSavedCars = async () => {
  const response = await axiosInstance.get('/saved-cars');
  return response.data;
};

export const saveCar = async (carId: string | number) => {
  const response = await axiosInstance.post(`/saved-cars/${carId}`);
  return response.data;
};

export const unsaveCar = async (carId: string | number) => {
  const response = await axiosInstance.delete(`/saved-cars/${carId}`);
  return response.data;
};

export const handleMessageSeller=async(payload:{user?:objectType,creator:objectType})=>{
try{
const response= await axiosInstance.post('/user/message-seller',payload)
return response
}catch(error){
    console.error("Error creating car:", error);
    throw error;
}
}

export const openDirectConversation = async (payload: { recipientId?: number | string; creator?: objectType }) => {
  const response = await axiosInstance.post<{ conversation: ChatConversation; channelId: string }>('/chat/conversations/direct', payload);
  return response.data;
};

export const getConversations = async () => {
  const response = await axiosInstance.get<{ conversations: ChatConversation[] }>('/chat/conversations');
  return response.data;
};

export const getMessages = async (conversationId: string, params?: PaginationParams) => {
  const response = await axiosInstance.get<{ messages: ChatMessage[]; hasMore: boolean }>(
    `/chat/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

export const sendMessage = async (conversationId: string, payload: FormData) => {
  const response = await axiosInstance.post<{ message: ChatMessage }>(
    `/chat/conversations/${conversationId}/messages`,
    payload
  );
  return response.data;
};

export const editMessage = async (messageId: string, text: string) => {
  const response = await axiosInstance.patch<{ message: ChatMessage }>(`/chat/messages/${messageId}`, { text });
  return response.data;
};

export const markConversationRead = async (conversationId: string) => {
  const response = await axiosInstance.post(`/chat/conversations/${conversationId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
  const response = await axiosInstance.delete<{ message: ChatMessage }>(`/chat/messages/${messageId}`);
  return response.data;
};

export const toggleMessageReaction = async (messageId: string, emoji: string) => {
  const response = await axiosInstance.post<{ message: ChatMessage }>(`/chat/messages/${messageId}/reactions`, { emoji });
  return response.data;
};

export const toggleMessagePin = async (messageId: string) => {
  const response = await axiosInstance.post<{ message: ChatMessage }>(`/chat/messages/${messageId}/pin`);
  return response.data;
};

export const forwardMessage = async (messageId: string, privateUserIds: Array<number | string>) => {
  const response = await axiosInstance.post<{ message: string; messages: ChatMessage[] }>(`/chat/messages/${messageId}/forward`, {
    privateUserIds,
  });
  return response.data;
};

export const syncCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Error syncing current user:', error);
    throw error;
  }
};

export const updateCurrentUserProfile = async (payload: MarketplaceUserProfilePayload | FormData) => {
  try {
    const response = await axiosInstance.patch('/user/me', payload);
    return response.data;
  } catch (error) {
    console.error('Error updating current user:', error);
    throw error;
  }
};
