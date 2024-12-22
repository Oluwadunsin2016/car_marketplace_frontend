import React from 'react'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

const Layout = () => {
  return (
    <div>
    <Header/>
    <main>
    <Outlet/>
    </main>
        <Footer/>
         <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default Layout