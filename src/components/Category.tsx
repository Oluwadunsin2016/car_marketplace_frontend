import React from 'react';
import { category } from './shared/data';
import { Link } from 'react-router-dom';

const Category = () => {
  return (
    <div className='mt-10 md:mt-40'>
    <h2 className='font-bold text-3xl text-center mb-6'>Browse By Type</h2>

    <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-6 px-6 md:px-20'>
    {category.map((cat,i)=>(
    <Link to={`/search/${cat.name}`} key={i} >
    <div className='border rounded-xl p-3 flex items-center flex-col hover:shadow cursor-pointer'>
    <img src={cat.icon} height={35} width={35} />
    <h2 className='mt-2'>{cat.name}</h2>
    </div>
    </Link>
    ))}
    </div>
    </div>
  )
}

export default Category