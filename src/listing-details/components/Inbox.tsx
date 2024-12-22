// import React, { useEffect, useState } from "react";
// import { SendBirdProvider } from "@sendbird/uikit-react";
// import "@sendbird/uikit-react/dist/index.css";
// import { useUser } from "@clerk/clerk-react";
// import { GroupChannelList } from '@sendbird/uikit-react/GroupChannelList';
// import { GroupChannel } from '@sendbird/uikit-react/GroupChannel';

// const Inbox = () => {
//   const [userId, setuserId] = useState<string | undefined>("");
//   const [channelUrl, setChannelUrl] = useState<string | undefined>('')
//   const { user } = useUser();
//   useEffect(() => {
//     if (user) {
//       const id = user?.primaryEmailAddress?.emailAddress?.split("@")[0];
//       setuserId(id);
//     }
//   }, [user]);

//   return (
//     <div>
//       <div className="">
//         <SendBirdProvider
//           appId={import.meta.env.VITE_SENDBIRD_APP_ID}
//           userId={userId || ""}
//           nickname={user?.fullName || ""}
//           profileUrl={user?.imageUrl}
//           allowProfileEdit
//         >
//         <div className="grid gap-4 h-[80rem] md:h-[32rem] grid-cols-1 md:grid-cols-3">
//         {/* Left Side Channel List */}
// <div className="border p-5 shadow-lg">
// <GroupChannelList onChannelCreated={(value)=>console.log(value)} onChannelSelect={(channel)=>setChannelUrl(channel?.url)} channelListQueryParams={{includeEmpty:true}} />
// </div>

//         {/* Right Side Message Area */}
// <div className="md:col-span-2 shadow-lg">
// <GroupChannel channelUrl={channelUrl||''}  />
// </div>
//         </div>
//         </SendBirdProvider>
//       </div>
//     </div>
//   );
// };

// export default Inbox;

import React, { useEffect, useRef, useState } from "react";
import { SendBirdProvider } from "@sendbird/uikit-react";
import "@sendbird/uikit-react/dist/index.css";
import { useUser } from "@clerk/clerk-react";
import { GroupChannelList } from "@sendbird/uikit-react/GroupChannelList";
import { GroupChannel } from "@sendbird/uikit-react/GroupChannel";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useSearchParams } from "react-router-dom";
import { objectType } from "../../utils/types";
// import SendBird from "sendbird";



const Inbox = () => {
  const [userId, setUserId] = useState<string | undefined>("");
  const [channel, setChannel] = useState<objectType>();
  const [showChannelList, setShowChannelList] = useState<boolean>(true); // Manage visibility of GroupChannelList
  const { user } = useUser();
  const chatListRef = useRef(null);
  const [searchParams] = useSearchParams();

  const routeUserId = searchParams.get("id");

  useEffect(() => {
    if (user) {
      const id = user?.primaryEmailAddress?.emailAddress?.split("@")[0];
      setUserId(id);
    }
  }, [user]);

  const handleChannelSelect = (channel: objectType) => {
    if (routeUserId) {
      if (channel?.members?.some((member:objectType) => member.userId === routeUserId)) {
        setChannel(channel); // Automatically select channel with matching user ID
      }
    } else {
      setChannel(channel);
    }

    setShowChannelList(false); // Hide channel list on selecting a channel
  };

  const handleBackToChannelList = () => {
    setShowChannelList(true); // Show channel list on back button click
  };

  // Get receiver's profile image (only for one-on-one chat)
  const getReceiverProfilePicture = () => {
    if (!channel || !channel.members) return null;
    const receiver = channel.members.find(
      (member: objectType) => member.userId !== userId
    );
    return receiver?.profileUrl || null; // Return the profile picture of the receiver
  };

//   useEffect(() => {
//     if (routeUserId && userId) {
//       // Initialize Sendbird instance
//       const sb = new SendBird({ appId: import.meta.env.VITE_SENDBIRD_APP_ID });

//       // Authenticate the logged-in user
//       sb.connect(userId, (user, error) => {
//         if (error) {
//           console.error("SendBird connection error:", error);
//           return;
//         }

//         // Query group channels
//         const query = sb.groupChannel.createGroupChannelListQuery({
//           includeEmpty: true,
//         });

//         query.next((channels, error) => {
//           if (error) {
//             console.error("Channel list query error:", error);
//             return;
//           }

//           // Find the channel where the routeUserId matches
//           const matchedChannel = channels.find((channel) =>
//             channel.members.some((member) => member.userId === routeUserId)
//           );

//           if (matchedChannel) {
//             setChannelUrl(matchedChannel.url); // Set the active channel
//           } else {
//             console.warn("No channel found for user ID:", routeUserId);
//           }
//         });
//       });
//     }
//   }, [routeUserId, userId]);

  //    useEffect(() => {

  //     if (routeUserId && chatListRef.current) {
  //    console.log("userId:",routeUserId);
  //       const chatItems = chatListRef.current.querySelectorAll(
  //         ".sendbird-channel-preview"
  //       );
  //    console.log("currentRef:",chatItems);

  //       // Find the chat matching the user ID and trigger a click
  //       chatItems.forEach((item: HTMLElement) => {
  //         if (item.textContent?.includes(routeUserId)) {
  //         console.log(item);
  //           item.click();
  //         }
  //       });
  //     }
  //   }, [routeUserId]);

  //   Group Channel header
  const chatHeader = () => {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3 w-full">
          {/* Back Button */}
          <IoArrowBackCircleOutline
            size={25}
            onClick={handleBackToChannelList}
            className="md:hidden text-blue-500 font-medium"
          />
          <div className="flex items-center justify-between w-full">
            {/* Receiver Image */}
            <div className="flex items-center gap-3">
              {channel?.coverUrl && (
                <img
                  src={getReceiverProfilePicture()}
                  alt="Receiver"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <h2 className="text-lg font-semibold">
                {channel?.name || "Chat"}
              </h2>
            </div>
            <BsThreeDotsVertical
              size={25}
              className=" text-blue-500 font-medium cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden relative">
      <SendBirdProvider
        appId={import.meta.env.VITE_SENDBIRD_APP_ID}
        userId={userId || ""}
        nickname={user?.fullName || ""}
        profileUrl={user?.imageUrl}
        allowProfileEdit
      >
        <div className="h-[70vh] md:h-[90vh] grid grid-cols-1 md:grid-cols-3">
          {/* Left Side Channel List */}
          <div
            className={`absolute md:relative top-0 left-0 w-full h-full md:h-auto md:w-auto md:translate-x-0 transition-transform duration-300 ease-in-out bg-white shadow-lg border ${
              showChannelList ? "translate-x-0" : "-translate-x-full"
            }`}
            ref={chatListRef}
          >
            {/* <h2 className="text-lg font-semibold p-4 border-b">Channels</h2> */}
            <GroupChannelList
             onChannelCreated={(channel) =>
                console.log("Channel created:", channel)
              }
              onChannelSelect={handleChannelSelect}
              channelListQueryParams={{ includeEmpty: true }}
            />
          </div>

          {/* Right Side Message Area */}
          <div
            className={`absolute md:relative top-0 left-0 w-full h-full md:h-auto md:w-auto md:translate-x-0 transition-transform duration-300 ease-in-out bg-white shadow-lg border ${
              showChannelList ? "translate-x-full" : "translate-x-0"
            } md:col-span-2`}
          >
            {/* <div className="flex items-center p-4 border-b">
              <button
                onClick={handleBackToChannelList}
                className="md:hidden text-blue-500"
              >
                Back
              </button>
              <h2 className="text-lg font-semibold ml-4">Chat</h2>
            </div> */}
            {channel ? (
              <GroupChannel
                renderChannelHeader={chatHeader}
                channelUrl={channel?.url}
              />
            ) : (
              <div className="relative flex items-center justify-center h-full text-gray-500">
               <IoArrowBackCircleOutline
            size={25}
            onClick={handleBackToChannelList}
            className="md:hidden text-blue-500 font-medium absolute left-4 top-4"
          />
                <p>Select a channel to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </SendBirdProvider>
    </div>
  );
};

export default Inbox;
