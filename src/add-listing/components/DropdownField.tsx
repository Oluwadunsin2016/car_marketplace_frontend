import React, {useEffect} from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



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
    item:itemTypes;
     dataError:{[key:string]:boolean};
    formData: Record<string, string|number>;
    setFormData:React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
      handleInputChange:(name:string,value:string|number)=>void
    }
const DropdownField = ({item,handleInputChange,carInfo,setFormData,formData,dataError}:passedProps) => {

useEffect(() => {
  if (carInfo?.[item?.name]) {
    setFormData((prevData) => ({ ...prevData, [item?.name]: carInfo[item?.name] }));
  }
}, [carInfo, item?.name,setFormData]);

  return (
    <div>
    <Select onValueChange={(value:string)=>handleInputChange(item?.name,value)} value={formData[item?.name] || ""} >
  <SelectTrigger className={`${dataError?.[item?.name]?'border-red-500':'border-gray-200'} focus:border-primary rounded`}>
    <SelectValue placeholder={formData[item.name]??item?.label} />
  </SelectTrigger>
  <SelectContent className='bg-white rounded'>
  {item?.options?.map((option,i)=>(
    <SelectItem key={i} value={option}>{option}</SelectItem>
  ))}
  </SelectContent>
</Select>
 { dataError?.[item?.name] && <span className='text-sm text-red-500 mt-2'>{(item?.label)?.toLowerCase()} is required</span>}
    </div>
  )
}

export default DropdownField