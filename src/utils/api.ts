// import axiosInstance from "./axiosInstance"
import axiosInstance from "../components/shared/axiosInstance";
import { carListing, objectType } from "./types";

export const createCar=async(payload:carListing)=>{
console.log(payload);
try{
const response= await axiosInstance.post('/car/create',payload)
console.log(response)
return response
}catch(error){
    console.error("Error creating car:", error);
    throw error;
}
}
export const updateCar=async(payload:carListing)=>{
try{
console.log(payload);
const response= await axiosInstance.put('/car/update',payload)
console.log(response)
return response
}catch(error){
    console.error("Error updating car:", error);
    throw error;
}
}


export const getUserCars = async (userEmail: string) => {
  try {
    const response = await axiosInstance.get(`/car/user-cars/${userEmail}`);
    console.log("API Response:", response.data); // For debugging
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching user cars:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getAllCars = async () => {
  try {
    const response = await axiosInstance.get('/car/all-cars');
    console.log("API Response:", response.data); // For debugging
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getPopularCars = async () => {
  try {
    const response = await axiosInstance.get('/car/popular-cars');
    console.log("API Response:", response.data); // For debugging
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};

export const getParticularCar = async (id: number|string) => {
  try {
    const response = await axiosInstance.get(`/car/particular-car/${id}`);
    console.log("API Response:", response.data); // For debugging
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching this car:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const deleteParticularCar = async (id: number|string) => {
  try {
    const response = await axiosInstance.delete(`/car/delete/${id}`);
    console.log("API Response:", response.data);
    return response.data; 
  } catch (error) {
    console.error("Error deleting this car:", error);
    throw error; 
  }
};


export const getCarsByCategory = async (category: string) => {
  try {
    const response = await axiosInstance.get(`/car/cars/${category}`);
    console.log("API Response:", response.data); // For debugging
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars for this category:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getCarsByOptions = async (payload: {condition:string|null, make:string|null,sellingPrice:string|number|null}) => {
  try {
    const response = await axiosInstance.get(`/car/options`,{params:payload});
    console.log("API Response:", response.data); // For debugging
    return response.data; // Return the data for the query function
  } catch (error) {
    console.error("Error fetching cars for the provided options:", error);
    throw error; // Rethrow the error for proper error handling in `useQuery`
  }
};


export const getToken = async (userId:string|number) => {
  try {
   const response= await axiosInstance.get(`/user/get-token/${userId}`,)
  //  console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const getAvailableUsers = async (userId:string|number) => {
  try {
   const response= await axiosInstance.get(`/user/getAvailableUsers?currentUserId=${userId}`)
  //  console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

export const handleMessageSeller=async(payload:{user:objectType,creator:objectType})=>{
console.log(payload);
try{
const response= await axiosInstance.post('/user/message-seller',payload)
console.log(response)
return response
}catch(error){
    console.error("Error creating car:", error);
    throw error;
}
}