import React from 'react'
import Search from './Search'

const Hero = () => {
  return (
    <div>
    <div className='flex flex-col items-center gap-6 px-10 py-10 md:py-20 h-[450px] md:h-[650px] w-full bg-[#eef0fc]'>
    <h2 className='md:text-lg'>Find cars for sale and for rent near you</h2>
    <h2 className='text-[30px] md:text-[40px] lg:text-[60px] font-bold'>Find Your Dream Car</h2>
    <Search/>

    <img src="/tesla.png" alt="car" className='mt-10' />
    </div>
    </div>
  )
}

export default Hero