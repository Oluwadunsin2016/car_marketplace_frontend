import axios from "axios"

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://car-marketplace-backend.onrender.com/api/';
let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: (() => Promise<string | null>) | null) => {
  authTokenGetter = getter;
};

const axiosInstance=axios.create({
baseURL:baseUrl,
})

axiosInstance.interceptors.request.use(
async (config)=>{
const token = authTokenGetter ? await authTokenGetter() : null;
if (token) {
    config.headers.Authorization=`Bearer ${token}`
} 

if (!(config.data instanceof FormData)) {
    config.headers['Content-Type']='application/json'
}

return config
},
(error)=>{
return Promise.reject(error)
}
)


export default axiosInstance;
