
import { carListing } from '../../utils/types'
import { formatCurrency } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { MdOutlineLocalOffer } from 'react-icons/md'

const Pricing = ({ car,loading }: { car: carListing,loading:boolean }) => {
  return (
    <div>
       {loading?
    <div className="rounded-xl h-[200px] w-full bg-slate-200 animate-pulse">
    </div>
    :
    <div className='p-5 md:p-10 rounded-xl bg-white shadow-md border'>
    <h2 className='my-2 font-semibold md:text-2xl text-xl'>Our Price</h2>
    <h2 className='font-bold text-2xl md:text-4xl'>{formatCurrency(car?.sellingPrice)}</h2>
    <Button size='lg' className='rounded w-full text-white mt-6'><MdOutlineLocalOffer /> Make an Offer Price</Button>
    </div>
    }
    </div>
  )
}

export default Pricing