import { useEffect, useState } from "react";
import MyListing from "./components/MyListing";
import ProfileDetails from "./components/ProfileDetails";
import SavedCars from "./components/SavedCars";
import { useSyncCurrentUser } from "@/shared/api/hooks";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import { useSearchParams } from "react-router-dom";

const Profile = () => {
const [searchParams]=useSearchParams()
const [selectedTab, setSelectedTab] = useState('profile-details');
const tab=searchParams.get('tab')
const { data, isLoading } = useSyncCurrentUser();
const role = data?.user?.role;
const canSell = role === 'seller' || role === 'dealer';

const tabs=[
{label:'Profile details', value:'profile-details', component:ProfileDetails},
...(canSell ? [{label:'My listings', value:'my-listing', component:MyListing}] : []),
{label:'Saved cars', value:'saved-cars', component:SavedCars},
]

useEffect(() => {
if (tab) {
const requestedTab = tab === 'inbox' ? 'saved-cars' : tab;
const tabIsAvailable = tabs.some((item) => item.value === requestedTab);
setSelectedTab(tabIsAvailable ? requestedTab : 'profile-details')
}
}, [tab, canSell])

useEffect(() => {
if (!tabs.some((item) => item.value === selectedTab)) {
setSelectedTab('profile-details')
}
}, [canSell, selectedTab])


  return (
    <div className="mx-auto my-10 min-h-[80vh] max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Profile</h1>
      </div>
      <Tabs
        onValueChange={(value) => setSelectedTab(value)}
        value={selectedTab}
        className="w-full"
        
      >
        {isLoading ? (
          <div className="mb-6 h-11 w-full max-w-md animate-pulse rounded-lg bg-slate-100" />
        ) : null}
        {!isLoading ? (
        <TabsList className="mb-6 h-auto justify-start rounded-lg bg-slate-100 p-1">
          {tabs.map((tab,i)=>(
          <TabsTrigger key={i} value={tab.value} className={`rounded-md px-5 py-2.5 text-sm font-bold ${
        selectedTab === tab.value ? "!bg-white !text-slate-950 shadow-sm" : "text-slate-500"
      }`}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        ) : null}
        {tabs.map((tab,i)=>(
         <TabsContent key={i} value={tab.value}>
          <tab.component />
        </TabsContent>
          ))}
      </Tabs>
    </div>
  );
};

export default Profile;
