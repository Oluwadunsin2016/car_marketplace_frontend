import React from 'react'
import DetailHeader from '../components/DetailHeader'
import { useParams } from 'react-router-dom'
import { useGetParticularCar } from '../../utils/mutation'
import ImageGallery from '../components/ImageGallery'
import Description from '../components/Description'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import Specification from '../components/Specification'
import OwnerDetails from '../components/OwnerDetails'
import FinancialCalculator from '../components/FinancialCalculator'
import MostSearchedCars from '../../components/MostSearchedCars'


const ListingDetails = () => {
const {id}=useParams()
const {data,isPending}=useGetParticularCar(id||'')
console.log(data?.car);
  return (
<div className='px-6 py-4 md:py-10 md:px-20'>
    {/* Details header component */}
    <DetailHeader loading={isPending} car={data?.car}/>

    <div className='grid grid-cols-1 gap-6 md:grid-cols-3 my-6'>
    {/* Left */}
<div className='md:col-span-2 flex flex-col gap-6'>
{/* image gallery */}
<ImageGallery loading={isPending} images={data?.car?.carImages}/>

{/* Description */}
<Description loading={isPending} car={data?.car} />

{/* Features */}
<Features loading={isPending} features={data?.car?.features} />


{/* Calculator */}
<FinancialCalculator loading={isPending} car={data?.car}  />

</div>
    {/* Right */}
<div className='flex flex-col gap-6'>
    {/* Pricing */}
    <Pricing loading={isPending} car={data?.car}/>


    {/* Car Specification */}
    <Specification loading={isPending} car={data?.car}/>


    {/* Owerners Details */}
    <OwnerDetails loading={isPending} title={data?.car?.listingTitle} carId={id}  creator={data?.car?.creator}/>

</div>
    </div>

    <MostSearchedCars/>
</div>
  )
}

export default ListingDetails