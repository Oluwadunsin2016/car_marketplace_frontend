import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Separator } from '@radix-ui/react-select'
import { CiSearch } from 'react-icons/ci'
import { carMakes, pricing } from './shared/data'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../lib/utils'

const Search = () => {
const [cars, setCars] = useState('')
const [make, setMake] = useState('')
const [price, setPrice] = useState('')


  return (
    <div className='p-1 md:p-5 bg-white rounded-full flex md:gap-10 items-center md:w-[60%]'>
    <Select onValueChange={(value)=>setCars(value)}>
  <SelectTrigger className="outline-none border-none shadow-none text-lg">
    <SelectValue placeholder="Cars" />
  </SelectTrigger>
  <SelectContent className='bg-white rounded'>
    <SelectItem value="New">New</SelectItem>
    <SelectItem value="Used">Used</SelectItem>
    <SelectItem value="Certified Pre-owned">Certified Pre-owned</SelectItem>
  </SelectContent>
</Select>
<Separator className='bg-gray-200 text-gray-200 w-1 h-10 hidden md:block' />
    <Select onValueChange={(value)=>setMake(value)}>
  <SelectTrigger className="outline-none border-none shadow-none text-lg">
    <SelectValue placeholder="Car Makes" />
  </SelectTrigger>
  <SelectContent className='bg-white rounded'>
  {carMakes.map((car,i)=>(
    <SelectItem key={i} value={car.name}>{car.name}</SelectItem>
  ))}
  </SelectContent>
</Select>
<Separator className='bg-gray-200 text-gray-200 w-1 h-10 hidden md:block' />
    <Select onValueChange={(value)=>setPrice(value)}>
  <SelectTrigger className="outline-none border-none shadow-none text-lg">
    <SelectValue placeholder="Pricing" />
  </SelectTrigger>
  <SelectContent className='bg-white rounded'>
  {pricing.map((car,i)=>(
    <SelectItem key={i} value={car.amount}>{formatCurrency(car.amount)}</SelectItem>
  ))}
  </SelectContent>
</Select>
<div>
<Link to={`/search?cars=${cars}&make=${make}&price=${price}`}>
<CiSearch className='text-[40px] md:text-[50px] bg-primary p-2 md:p-3 rounded-full text-white hover:scale-105 transition-all cursor-pointer' />
</Link>
</div>
    </div>
  )
}

export default Search