import React from 'react'
import { carListing } from '../../utils/types'
import CarSpecification from '../../components/shared/CarSpecification'
import IconField from '../../add-listing/components/IconField'

const Specification = ({ car,loading }: { car: carListing,loading:boolean }) => {
  return (
    <div>
       {loading?
    <div className="rounded-xl h-[40rem] w-full bg-slate-200 animate-pulse">
    </div>
    :
    <div className='p-5 md:p-10 rounded-xl bg-white shadow-md border'>
    <h2 className='my-2 font-semibold md:text-2xl text-xl mb-4'>Specifications</h2>
    {CarSpecification?.map((item,index)=>(
    <div key={index} className=' my-4 flex items-center justify-between'>
    <h2 className='flex gap-2 items-center'><IconField iconName={item.icon} /> {item.label}</h2>
    <h2>{car&&car[item?.name]}</h2>
    </div>
    ))}
    </div>
    }
    </div>
  )
}

export default Specification