import React from 'react'
import { Input } from '../../components/ui/input'


type itemTypes= {
      label: string,
      name: string,
      fieldType: string,
      required?: boolean,
      column: number|string,
      options?: string[],
      icon: string,
    }

    type passedProps={
    carInfo:{[key:string]:number|string};
    dataError:{[key:string]:boolean};
    item:itemTypes;
      handleInputChange:(name:string,value:string|number)=>void
    }
const InputField = ({item,handleInputChange,carInfo,dataError}:passedProps )=> {
// required={item?.required}
  return (
    <div>
    <Input onChange={(e)=>handleInputChange(item?.name,e.target.value)} className={`${dataError?.[item?.name]?'border-red-500':'border-gray-200'} focus:border-primary rounded`} type={item?.fieldType} defaultValue={carInfo?.[item?.name]} name={item?.name}/>
    { dataError?.[item?.name] && <span className='text-sm text-red-500 mt-2'>{(item?.label)?.toLowerCase()} is required</span>}
    </div>
  )
}

export default InputField