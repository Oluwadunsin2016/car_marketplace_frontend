import { useEffect, useState } from "react";
import MyListing from "./components/MyListing";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import Chats from "../chat/Chats";

const Profile = () => {
const [searchParams]=useSearchParams()
const [selectedTab, setSelectedTab] = useState('my-listing');
const tab=searchParams.get('tab')

useEffect(() => {
if (tab) {
setSelectedTab(tab||'')
}
}, [tab])

const tabs=[
{label:'My Listing', value:'my-listing', component:MyListing},
{label:'Inbox', value:'inbox',component:Chats},
]


  return (
    <div className="px-4 md:px-20 my-10 min-h-[80vh]">
      <Tabs
        onValueChange={(value) => setSelectedTab(value)}
        value={selectedTab}
        className="w-full"
        
      >
        <TabsList className="justify-start mb-4 px-2 py-6 rounded bg-slate-200">
          {tabs.map((tab,i)=>(
          <TabsTrigger key={i} value={tab.value} className={`rounded py-2 px-6 ${
        selectedTab === tab.value ? "!bg-blue-500 !text-white" : "bg-white"
      }`}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
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
