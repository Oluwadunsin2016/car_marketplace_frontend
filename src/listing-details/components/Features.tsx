/* eslint-disable @typescript-eslint/no-unused-vars */

import { MdCheck } from 'react-icons/md';

const Features = ({features,loading}:{features:{[key:string]:boolean},loading:boolean}) => {
console.log(features);

  return (
    <div>
    {loading?
    <div className="rounded-xl h-[150px] w-full bg-slate-200 animate-pulse">
    </div>
    :
    <div className='bg-white p-5 rounded-xl border shadow-md'>
    <h2 className='font-medium text-xl md:text-2xl'>Features</h2>
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4'>
    {Object?.entries(features).map(([featureKey,value],i)=>(
    <div key={i} className='flex items-center gap-1'>
        <MdCheck className='text-lg bg-blue-100 text-primary p-0.5 rounded-full' />
    <h2>{featureKey}</h2>
    
    </div>
    ))}
    </div>
    </div>
    }
    </div>
  )
}

export default Features