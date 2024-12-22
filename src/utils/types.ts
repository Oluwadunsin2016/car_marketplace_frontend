// type featureType = { [key: string]: boolean  };

export type formdataType ={
  listingTitle: string;
  tagLine?: string;
  originalPrice?: string;
  sellingPrice: string;
  category: string;
  condition: string;
  type: string;
  make: string;
  model: string;
  year: string;
  driveType: string;
  transmission: string;
  fuelType: string;
  mileage: string;
  engineSize?: string;
  cylinder?: string;
  color: string;
  door: string;
  offerType?: string;   
  vin?: string;
  listingDescription: string;
}

export interface user{
id:string,
name:string,
email:string,
imageUrl:string
}

export type carListing ={
  id?: number|string;
  creator?: user;
  carImages?: string[];
  listingTitle: string;
  tagLine?: string;
  originalPrice?: string;
  sellingPrice: string;
  category: string;
  condition: string;
  type: string;
  make: string;
  model: string;
  year: string;
  driveType: string;
  transmission: string;
  fuelType: string;
  mileage: string;
  engineSize?: string;
  cylinder?: string;
  color: string;
  door: string;
  offerType?: string;   
  vin?: string;
  listingDescription: string;
  features?:Record<string, boolean> 
}

export type objectType={[key:string]:string | boolean | number|object|null|undefined}
