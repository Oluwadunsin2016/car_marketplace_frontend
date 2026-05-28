import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"



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
    item:itemTypes;
     dataError:{[key:string]:boolean};
    formData: Record<string, string|number>;
      handleInputChange:(name:string,value:string|number)=>void
    }
const DropdownField = ({item,handleInputChange,formData,dataError}:passedProps) => {

  return (
    <div>
    <Select onValueChange={(value:string)=>handleInputChange(item?.name,value)} value={String(formData[item?.name])} >
  <SelectTrigger className={`h-11 rounded-md bg-white text-sm ${dataError?.[item?.name]?'border-red-500 focus:ring-red-100':'border-slate-300 focus:ring-blue-100'} focus:border-blue-500`}>
    <SelectValue placeholder={formData[item.name]??item?.label} />
  </SelectTrigger>
  <SelectContent className='rounded-md border-slate-200 bg-white'>
  {item?.options?.map((option,i)=>(
    <SelectItem key={i} value={option}>{option}</SelectItem>
  ))}
  </SelectContent>
</Select>
 { dataError?.[item?.name] && <span className='mt-2 block text-xs font-semibold text-red-500'>{(item?.label)?.toLowerCase()} is required</span>}
    </div>
  )
}

export default DropdownField
