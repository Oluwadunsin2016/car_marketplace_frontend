import axios from "axios";

const SendBirdApplicationId=import.meta.env.VITE_SENDBIRD_APP_ID;
const SendBirdApiToken=import.meta.env.VITE_SENDBIRD_API_TOKEN;
// export const FormatResult=(resp)=>{
//     let result:=[];
//     let finalResult=[];
//     resp.forEach((item)=>{
//         const listingId=item.carLisiting?.id;
//         if(!result[listingId])
//         {
//             result[listingId]={
//                 car:item.carLisiting,
//                 images:[]
//             }
//         }

//         if(item.carImages)
//         {
//             result[listingId].images.push(item.carImages)
//         }
//     })
   
//     result.forEach((item)=>{
//         finalResult.push({
//             ...item.car,
//             images:item.images
//         })
//     })
 
//     return finalResult;
// }

export const createSendBirdUser=(userId:string|undefined,nickName:string|undefined|null,profileUrl:string|undefined)=>{
    
    return axios.post(`https://api-${SendBirdApplicationId}.sendbird.com/v3/users`,{
        user_id:userId,
        nickname:nickName,
        profile_url:profileUrl,
        issue_access_token:false
    },{
        headers:{
            'Content-Type':'application/json',
            'Api-Token':SendBirdApiToken
        }
    });
}


export const CreateSendBirdChannel=(users:string[],title:string)=>{
    return axios.post(`https://api-${SendBirdApplicationId}.sendbird.com/v3/group_channels`,{
        user_ids:users,
        is_distinct:true,
        name:title,
        operator_ids:[users[0]]

    },{
        headers:{
            'Content-Type':'application/json',
            'Api-Token':SendBirdApiToken
        }
    })
}

