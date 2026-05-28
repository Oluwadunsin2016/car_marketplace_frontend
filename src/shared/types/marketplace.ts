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
appUserId?: number | string,
name:string,
email:string,
imageUrl:string,
image?: string | null,
role?: 'buyer' | 'seller' | 'dealer' | 'user',
phone?: string | null,
location?: string | null,
dealerName?: string | null,
}

export type carListing ={
  _id?: number|string;
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
  features?:Record<string, boolean>;
  status?: 'active' | 'sold';
}

export type objectType={[key:string]:string | boolean | number|object|null|undefined}

export type MarketplaceUser = {
  id: string;
  appUserId: number | string;
  name: string;
  email: string;
  image?: string | null;
  imageUrl?: string | null;
  authProvider: string;
  role: 'buyer' | 'seller' | 'dealer' | 'user';
  phone?: string | null;
  location?: string | null;
  dealerName?: string | null;
  profileComplete: boolean;
  missingProfileFields?: string[];
};

export type MarketplaceUserProfilePayload = {
  name: string;
  phone: string;
  location: string;
  dealerName?: string | null;
  role: 'buyer' | 'seller' | 'dealer';
};

export type ChatUser = {
  _id: string;
  id: string;
  appUserId: number | string;
  name: string;
  username?: string;
  email: string;
  imageUrl?: string | null;
  lastSeen?: string | null;
};

export type ChatAttachment = {
  url: string;
  publicId?: string;
  resourceType?: string;
  type: 'image' | 'video' | 'audio' | 'file';
  mimeType?: string;
  name?: string;
  size?: number;
};

export type ChatReaction = {
  userId: number | string;
  user?: ChatUser | number | string;
  emoji: string;
  createdAt: string;
};

export type ChatMessage = {
  _id: string;
  conversation: string;
  sender: ChatUser | null;
  text: string;
  attachments: ChatAttachment[];
  messageType: string;
  readBy: string[];
  replyTo?: ChatMessage | null;
  reactions: ChatReaction[];
  pinnedBy: string[];
  deletedForEveryone: boolean;
  isForwarded?: boolean;
  forwardedFrom?: {
    messageId?: number | string;
    senderId?: number | string;
  } | null;
  isEdited: boolean;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatConversation = {
  _id: string;
  type: 'direct';
  members: ChatUser[];
  lastMessage?: ChatMessage | null;
  lastMessageAt: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
};
