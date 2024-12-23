/* eslint-disable @typescript-eslint/no-unused-vars */
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
import { Channel as ChannelProps, DefaultGenerics, StreamChat, UserResponse } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import { getToken } from "@/utils/api";
import { useGetAvailableUsers, useMessageSeller } from "@/utils/mutation";
import { Select } from "antd";
import { notifier } from "@/utils/lib";
import { objectType } from "@/utils/types";
import { useSearchParams } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import moment from "moment";

const apiKey = import.meta.env.VITE_PUBLIC_REACT_APP_STREAM_KEY || "";

interface Member {
  user: UserResponse & { id: string; name?: string; image?: string; online?: boolean; last_active?: string };
}

interface CustomChannelHeaderProps {
  activeChannel: ChannelProps;
  userId: string; // Assuming `userId` is a prop passed to the component
  setShowChannelList: (value: boolean) => void; // Assuming this is a callback prop
}


const Chats = () => {
  const { user } = useUser();
  const [client, setClient] = useState<StreamChat<DefaultGenerics> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<ChannelProps<DefaultGenerics> | null>(null);
  const [showChannelList, setShowChannelList] = useState<boolean>(true);
  const [contacts, setContacts] = useState<objectType[]>([]);

  const userId = user?.id || "";
  const { data: availableUsers } = useGetAvailableUsers(userId);
  const { mutateAsync: messageSeller } = useMessageSeller();
  const [searchParams] = useSearchParams();
  const creatorId = searchParams.get("id");
  console.log("creatorId:", creatorId);

  useEffect(() => {
    if (creatorId) {
      const creator = availableUsers?.find(
        (creator: { [key: string]: string }) => creator?.id == creatorId
      );
      console.log("creator:", creator);
      if (creator) {
        messageSomeone(creator);
      }
    }
  }, [creatorId]);

  useEffect(() => {
    const mappedUsers = Array.isArray(availableUsers)
      ? availableUsers.map((currentUser: { [key: string]: string }) => ({
          ...currentUser,
          value: currentUser.name,
          label: currentUser.name,
        }))
      : [];
    setContacts(mappedUsers);
  }, [availableUsers]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!userId) {
          console.error("User ID is missing!");
          return;
        }

        const { token } = await getToken(userId);

        if (!apiKey) {
          console.error("API key is missing!");
          return;
        }

        const chatClient = StreamChat.getInstance(apiKey);

        await chatClient.connectUser(
          {
            id: userId,
            name: user?.fullName || "",
          },
          token
        );

        setClient(chatClient);
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      // Cleanup function: disconnect client only if the component is unmounting
      if (client) {
        client?.disconnectUser();
      }
    };
  }, [userId, user?.fullName]);

  const changeChannel = async (channelId: string) => {
    try {
      // setLoading(true); // Indicate loading during channel switching
      const chatChannel = client && client.channel("messaging", channelId);
      await chatChannel?.watch();
      setActiveChannel(chatChannel);
      setShowChannelList(false);
    } catch (error) {
      console.error("Error selecting channel:", error);
    } finally {
      setLoading(false);
    }
  };

 const handleChannelSelect = (channel: {data: {
    id: string;
    [key: string]: string;
  }}) => {
    changeChannel(channel.data.id);
};

  const messageSomeone = async (creator: objectType) => {
    if (user) {
      const payload = {
        user: {
          id: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          image: user?.imageUrl,
        },
        creator: {
          id: creator?.id,
          name: creator?.name,
          email: creator?.email,
          image: creator?.imageUrl,
        },
      };
      await messageSeller(payload, {
        onSuccess(data) {
          changeChannel(data?.data?.channelId);
        },
        onError(error) {
          console.log(error);
        },
      });
    } else {
      notifier({
        message: "There is an error opening this chat",
        type: "error",
      });
    }
  };

  const onChange = (_e: Event, contact: any) => {
    if (!contact) {
      console.error("Invalid contact provided");
      return;
    }
    const { label, value, ...rest } = contact;
    messageSomeone(rest);
  };

  const CustomChannelPreview = (props:any) => {
    const { channel } = props;

    // Extract recipient details
     const members: Member[] = Object.values(channel.state.members) as Member[];
    const recipient = members.find((member) => member.user.id !== userId)?.user;
    console.log("members:", members);

    const getInitials = (name: string) => {
      if (!name) return "U"; // Default fallback for unnamed users
      const nameParts = name.split(" ");
      const initials =
        nameParts.length > 1
          ? nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase()
          : nameParts[0][0].toUpperCase();
      return `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`;
    };

    return (
      <div
        onClick={() => handleChannelSelect(channel)}
        className="cursor-pointer hover:bg-gray-100 p-2 rounded-md flex items-center gap-3"
      >
        <div className="w-8 h-8 flex-none rounded-full overflow-hidden">
          <img
            src={recipient?.image || getInitials(recipient?.name ||'')} // Fallback to default image
            alt={recipient?.name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-sm line-clamp-1">
            {recipient?.name || "Unnamed User"}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {channel.state.messages[channel.state.messages.length - 1]?.text ||
              "No messages yet"}
          </p>
        </div>
      </div>
    );
  };

const CustomChannelHeader: React.FC<CustomChannelHeaderProps> = ({
  activeChannel,
  userId,
  setShowChannelList,
}) => {
  const members: Member[] = Object.values(activeChannel.state.members) as Member[];

  const recipient = members.find((member) => member.user.id !== userId)?.user;

  const getInitials = (name?: string): string => {
    if (!name) return "U"; // Default fallback for unnamed users
    const nameParts = name.split(" ");
    const initials =
      nameParts.length > 1
        ? nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase()
        : nameParts[0][0].toUpperCase();
    return `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`;
  };

    const isOnline = recipient?.online;
    const lastSeen = recipient?.last_active
      ? moment(recipient?.last_active).fromNow()
      : "Offline";

    return (
      <div className="flex items-center flex-row-reverse md:flex-row justify-between gap-3 p-3 border-b border-gray-300">
        <div className="flex items-center md:flex-row-reverse gap-3">
        <div>
            <p className="font-semibold line-clamp-1">
              {recipient?.name || "Unnamed User"}
            </p>
            <p className="text-sm text-gray-500">
              {isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span>{lastSeen}</span>
              )}
            </p>
          </div>
          <div className="relative w-10 h-10 rounded-full flex-none">
          <span className={`${recipient?.online?"bg-green-500":"bg-gray-300"} absolute top-0 right-0.5 w-2.5 h-2.5  rounded-full shadow`}></span>
            <img
              src={recipient?.image || getInitials(recipient?.name)}
              alt={recipient?.name || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
        </div>
         <div className="md:hidden">
          <BsThreeDotsVertical
            onClick={() => setShowChannelList(true)}
            size={25}
            className=" text-blue-500 font-medium cursor-pointer"
          />
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        Loading chat...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        Error loading chat. Please try again later.
      </div>
    );
  }

  const filters = { members: { $in: [userId] }, type: "messaging" };
  const options = { presence: true, state: true };
const sort:any = { last_message_at: -1 }; // Original data

  return (
    <Chat client={client} theme="messaging light">
      <div className="h-[70vh] relative overflow-hidden border scrollbar-none rounded-lg md:h-[90vh] grid grid-cols-1 md:grid-cols-4">
        <div
          className={`absolute md:relative top-0 left-0 w-full h-full md:h-auto md:w-auto md:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-50 md:border-r border-gray-300 shadow-lg p-4 ${
            showChannelList ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* <button onClick={deleteEverything}>Format</button> */}
          <div className="border-b border-gray-300 pb-4">
            <h3 className="font-semibold mb-2">Create New Chat</h3>
            <Select
              showSearch
              placeholder="Select a person"
              optionFilterProp="label"
              className="w-full"
              labelInValue
              options={contacts}
              onChange={onChange}
              optionRender={(contact) => {
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-none">
                      <img
                        src={typeof contact?.data?.imageUrl === "string" ? contact?.data?.imageUrl : undefined}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="line-clamp-1">{String(contact?.data?.name || "Unnamed Contact")}</p>
                  </div>
                );
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Chats</h3>
            <ChannelList
              sort={sort}
              filters={filters}
              options={options}
              Preview={CustomChannelPreview}
            />
          </div>
        </div>
        <div
          className={`absolute md:relative top-0 left-0 w-full h-full md:h-auto md:w-auto md:translate-x-0 transition-transform duration-300 ease-in-out bg-white shadow-lg ${
            showChannelList ? "translate-x-full" : "translate-x-0"
          } md:col-span-3`}
        >
          {activeChannel ? (
            <Channel channel={activeChannel}>
              <Window>
              <div className="flex flex-col h-[calc(76svh-64px)] md:h-[calc(100svh-64px)] overflow-hidden">
                <CustomChannelHeader setShowChannelList={setShowChannelList} userId={userId} activeChannel={activeChannel} />

                {/* Scrollable Message List */}
                <div className="flex-1 overflow-y-auto customScrollbar">
                  <MessageList  />
                </div>

                {/* Fixed Input */}
                <div className="border-t border-gray-300 bg-gray-50 p-2">
                  <MessageInput />
                </div>
              </div>
              </Window>

              <Thread />
            </Channel>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 text-lg italic">
                Select a person start chat with
              </p>
            </div>
          )}
        </div>
      </div>
    </Chat>
  );
};

export default Chats;
