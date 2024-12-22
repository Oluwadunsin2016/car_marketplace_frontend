
import { carListing } from '../../utils/types'

const Description = ({ car,loading }: { car: carListing,loading:boolean }) => {
  return (
    <div>
    {loading?
    <div className="rounded-xl h-[100px] w-full bg-slate-200 animate-pulse">
    </div>
    :
    <div  className='p-5 rounded-xl bg-white shadow-md border'>
    <h2 className='my-2 font-semibold md:text-2xl text-xl'>Description</h2>
    <p>{car?.listingDescription}</p>
    </div>
    }
    </div>
  )
}

export default Description