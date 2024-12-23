import axios from "axios"

// const baseUrl = 'https://car-marketplace-backend-six.vercel.app/api/';
const baseUrl = 'https://car-marketplace-backend.onrender.com/api/';

const axiosInstance=axios.create({
baseURL:baseUrl,
headers:{
'Content-Type':'application/json'
}
})

axiosInstance.interceptors.request.use(
(config)=>{
const  token=localStorage.getItem('marketplaceToken')
if (token) {
    config.headers.Authorization=`Bearer ${token}`
} 
return config
},
(error)=>{
return Promise.reject(error)
}
)


export default axiosInstance;
