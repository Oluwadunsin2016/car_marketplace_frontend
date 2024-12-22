import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './home'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Contact from './Contact'
import { ClerkProvider } from '@clerk/clerk-react'
import Profile from './profile'
import AddListing from './add-listing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'
import SearchByOptions from './search'
import SearchByCategory from './search/[category]'
import ListingDetails from './listing-details/[id]'
import Layout from './Layout'
import Chats from './chat/Chats'


const queryClient=new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router = createBrowserRouter([
{
path:'/',
element:<Layout/>,
children:[
{
path:'/',
element:<Home/>
},
{
path:'/contact',
element:<Contact/>
},
{
path:'/profile',
element:<Profile/>
},
{
path:'/add-listing',
element:<AddListing/>
},
{
path:'/search',
element:<SearchByOptions/>
},
{
path:'/message',
element:<Chats/>
},
{
path:'/search/:category',
element:<SearchByCategory/>
},
{
path:'/listing-details/:id',
element:<ListingDetails/>
},
]
}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <QueryClientProvider client={queryClient}>
     <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <RouterProvider router={router} />
      <Toaster />
    </ClerkProvider>
  </QueryClientProvider>
  </StrictMode>,
)
