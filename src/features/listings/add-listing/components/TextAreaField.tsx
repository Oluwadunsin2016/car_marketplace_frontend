import { Textarea } from "@/shared/ui/textarea"


type itemTypes= {
      label: string,
      name: string,
      fieldType: string,
      required?: boolean,
      column: number|string,
      options?: string[],
      icon: string
    }

       type passedProps={
       dataError:{[key:string]:boolean};
    item:itemTypes;
    value: string | number;
      handleInputChange:(name:string,value:string|number)=>void
    }
const TextAreaField = ({item,handleInputChange,value,dataError}:passedProps) => {
  return (
    <div>
    <Textarea value={value ?? ""} onChange={(e)=>handleInputChange(item?.name,e.target.value)} className={`min-h-32 rounded-md bg-white text-sm ${dataError?.[item?.name]?'border-red-500 focus-visible:ring-red-100':'border-slate-300 focus-visible:ring-blue-100'} focus-visible:border-blue-500`} name={item?.name} />
    { dataError?.[item?.name] && <span className='mt-2 block text-xs font-semibold text-red-500'>{(item?.label)?.toLowerCase()} is required</span>}
    </div>
  )
}

export default TextAreaField
