import conversationModel from "../models/conversation";
import message from "../models/message";
import sessionModel from "../models/session";
import userModel from "../models/user";
import mongoose from "mongoose";
import { Config, getFileById, getImageById, getMediaById } from "./apiHandler";
import { io } from "../server";

//# This for creating a NEW session
export async function createSession(phone_no: string): Promise<boolean> {
    console.log("createSession start");
        try {
            // Create a new session object
            const newSession = new sessionModel({
                id: new mongoose.Types.ObjectId().toString(), // Generate a new ObjectId and convert it to string
                phoneNumber: phone_no,
            });

            // Save the session object to the database
            await newSession.save();
            
            // If saving is successful, return true
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            console.error("Error creating session:", error);
            return false;
        }
}

//# This for update the EXISTING session
export async function updateSessionCurrentPath(sessionId: mongoose.Types.ObjectId, newCurrentPath: string): Promise<boolean> {
    console.log("updateSessionCurrentPath start");
        try {
            // Update the session's currentPath field
            const result = await sessionModel.findByIdAndUpdate(
                sessionId,
                { 
                    currentPath: newCurrentPath,
                    updatedTime: new Date()
                }, // Only updating the currentPath field
                { new: true }
            );
            console.log("updateSessionCurrentPath boolean ",!!result);
            return !!result; // If result is truthy, return true; otherwise, return false
        } catch (error) {
            console.error("Error updating updateSessionCurrentPath:", error);
            return false; // Return false in case of an error
        }
}


export async function deleteCurrentSession(existingSessionId: mongoose.Types.ObjectId) {
    try {
        // Delete the session document
        await sessionModel.deleteOne({ _id: existingSessionId }).exec();
        console.log('Session deleted successfully');
    } catch (error) {
        console.error('Error deleting session:', error);
    }
}

export async function createNewUser(phone_no: string): Promise<boolean> {
    console.log("createNewUser start");

        try {
            // Create a new user object
            const newUser = new userModel({
                id: new mongoose.Types.ObjectId().toString(), // Generate a new ObjectId and convert it to string
                phoneNumber: phone_no,
            });

            // Save the user object to the database
            await newUser.save();
            
            // If saving is successful, return true
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            console.error("Error creating user:", error);
            return false;
        }
}





export async function pushTextMessage(body_param: any,unsupported:boolean=false): Promise<boolean> {
    console.log("pushTextMessage start");

        try {

            const oldMessage = await message.findOne({wamid:body_param.entry[0].changes[0].value.messages[0].id,admin:false});
            if(oldMessage){
                console.log(oldMessage);
                console.log("message already found");
                return false
            }
            const msgtimeStamp=body_param.entry[0].changes[0].value.messages[0].timestamp;
            const type= body_param.entry[0].changes[0].value.messages[0].type;
            const botNumber=body_param.entry[0].changes[0].value.metadata.display_phone_number;
            const senderPhoneNo=body_param.entry[0].changes[0].value.contacts[0].wa_id;
            const senderName=body_param.entry[0].changes[0].value.contacts[0].profile.name;
           
           
            const userFound=await userModel.findOne({"AppConfig.phoneNumber":botNumber})
            // if(user)
            // let unReadMsgCount=0;
        //    if(conversation&&(typeof conversation.unReadMsgCount==="number")) unReadMsgCount=conversation.unReadMsgCount;
console.log(userFound);

        if(userFound){
            const conversation=await conversationModel.findOne({senderPhoneNumber:senderPhoneNo,userId:userFound._id});
            const {AppConfig:{phone_number_id,token,version}}=userFound as any;
            const config:Config={phone_number_id,token,version};
            console.log("userconfig:",config);
            const userId=userFound._id.toString();
            
            let content;
    
            if(unsupported){
                console.log("unsupported type");
                
                content={unsupported:true}
            }else if(type==="text"){
                content={text:body_param.entry[0].changes[0].value.messages[0].text.body}
            }else if(type==="image"){
                
                const file=await getMediaById(config,body_param.entry[0].changes[0].value.messages[0].image.id);
                if(body_param.entry[0].changes[0].value.messages[0].image?.caption){
    
                    content={image:{...file,caption:body_param.entry[0].changes[0].value.messages[0].image.caption}}
    
                }else{
    
                    content={image:file}
                }
    
            }else if (type ==="video"){
                const file = await getMediaById(config, body_param.entry[0].changes[0].value.messages[0].video.id
                );
                if(body_param.entry[0].changes[0].value.messages[0].video?.caption){
    
                    content={video:{...file,caption:body_param.entry[0].changes[0].value.messages[0].video.caption}}
    
                }else{
    
                    content={video:file}
                }
            }else if (type ==="audio"){
                const file = await getMediaById(config, body_param.entry[0].changes[0].value.messages[0].audio.id
                );
                  content = { audio: file };
            }else if (type ==="document"){
                const file = await getFileById(config, body_param.entry[0].changes[0].value.messages[0].document.id,
                    body_param.entry[0].changes[0].value.messages[0].document.filename);
                    if(body_param.entry[0].changes[0].value.messages[0].document?.caption){
    
                        content={document:{...file,caption:body_param.entry[0].changes[0].value.messages[0].document.caption}}
    
                    }else{
    
                        content = { document: file };
                    }
                  
            }else if (type ==="button"){
                content={button:body_param.entry[0].changes[0].value.messages[0].button}
            }
    
            const msg:any={
                userId:userFound._id,
                wamid:body_param.entry[0].changes[0].value.messages[0].id,
                senderName:senderName,
                senderId:senderPhoneNo,
                phone_number_id:body_param.entry[0].changes[0].value.metadata.phone_number_id,
                type: type,
                timeStamp:msgtimeStamp,
                content:content
    
            }
             console.log(msg);
             
            
    
            if(body_param.entry[0].changes[0].value.messages[0]?.context && body_param.entry[0].changes[0].value.messages[0]?.context.id){
                const refMessage = await message.findOne({wamid:body_param.entry[0].changes[0].value.messages[0]?.context.id});
                if(refMessage){
    
                    msg.context={
                        ...body_param.entry[0].changes[0].value.messages[0].context,
                        type:refMessage.type,
                        content:refMessage.content
                    };
                }
            }
             
            if(!conversation){
                const newConversation=new conversationModel({
                    userId:userFound._id,
                    senderPhoneNumber:senderPhoneNo,
                    senderName:senderName,
                    botPhoneNumber:botNumber,
                    isConversationOpen:true,
                    CSWindowTimeStamp:msgtimeStamp
                })
                const textMessage =await message.create(msg);
    
                if(textMessage){
                    newConversation.latestMessage=textMessage._id;
                    newConversation.messages.push(textMessage._id);
                    newConversation.unReadMsgCount=1;
                   // newConversation.lastMsgTimeStamp=body_param.entry[0].changes[0].value.messages[0].timestamp;
                    const success=await newConversation.save();
    
                    if(success){
                        const result:any=success
                        result.latestMessage=textMessage
                        console.log("newconversation message push success");
                        // io.emit("newMessage",textMessage);
                        io.to(userId).emit("newConvo",result);
                        io.to(userId).emit("conversationOpen",{isConversationOpen:true,sender:newConversation.senderPhoneNumber,timeStamp:msgtimeStamp});
                        return true;
                    }else{
                        console.log("newconversation message push failed");
                        return false;
                    }
                }else{
                    console.log("text message creation failed in new conversation");
                    return false;
                }
    
            }
    
    
    
    
            // Create a new session object
            const textMessage = await message.create(msg);
            if(textMessage&&conversation&&(typeof conversation.unReadMsgCount==="number")){
                conversation.latestMessage=textMessage._id;
                conversation.messages.push(textMessage._id);
                conversation.unReadMsgCount=conversation.unReadMsgCount+1;
               // conversation.lastMsgTimeStamp=body_param.entry[0].changes[0].value.messages[0].timestamp;
               if(conversation.CSWindowTimeStamp==="zero"){
                conversation.isConversationOpen=true
                conversation.CSWindowTimeStamp=msgtimeStamp
                io.to(userId).emit("conversationOpen",{isConversationOpen:true,sender:conversation.senderPhoneNumber,timeStamp:msgtimeStamp});
               }else{
    
                   const current=new Date().getTime()/1000;
                   const timeDi=(current-Number(conversation.CSWindowTimeStamp));
                   console.log(timeDi);
    
                   if(!conversation.isConversationOpen){
                       conversation.isConversationOpen=true
                   }
                   if(timeDi>24*60*60){
                    io.to(userId).emit("conversationOpen",{isConversationOpen:true,sender:conversation.senderPhoneNumber,timeStamp:msgtimeStamp});
                     conversation.CSWindowTimeStamp=msgtimeStamp
                   }
               }
    
                const success=await conversation.save();
    
                if(success){
                    console.log("conversation message push success",textMessage);
                    io.to(userId).emit("newMessage",textMessage);
                    return true;
                }else{
                    console.log("conversation message push failed");
                    return false;
                }
            }else{
                console.log("text message creation failed in new conversation");
                return false;
            }
        }else{
            console.log("user Not found");
            
            return false;
        }


        } catch (error) {
            // If an error occurs, log it and return false
            console.error("Error pushing message:", error);
            return false;
        }
}


export async function updateStatusToDelivered(body_param: any): Promise<boolean> {
    console.log("updateStatus start(sent)");

    const wamid=body_param.entry[0].changes[0].value.statuses[0].id;
    //const status=body_param.entry[0].changes[0].value.statuses[0].status;
    const recipientId = body_param.entry[0].changes[0].value.statuses[0].recipient_id;
    const phoneNumberId = body_param.entry[0].changes[0].value.metadata.phone_number_id;

        try {
            const msg=await message.findOne({phone_number_id:phoneNumberId,senderId:recipientId,admin:true,status:"sent"}).sort({ createdAt: -1 });
            console.log(msg);
            msg && console.log(msg.wamid);


            if(msg && (msg.wamid===undefined)){

                msg.wamid=wamid;
                msg.status="delivered";
                
               const success= await msg.save();
               success && console.log("updated sent to delivered:",success.content?.text&&success.content?.text);
            }else{
                console.log("not found in the updateStatusToDelivered");
                
            }
            
            // If saving is successful, return true
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            console.error("Error updateStatusToDelivered:", error);
            return false;
        }
}

// export async function updateStatusToRead(body_param: any): Promise<boolean> {
//     console.log("updateStatus start(read)");

//     // const wamid=body_param.entry[0].changes[0].value.statuses[0].id;
//     //const status=body_param.entry[0].changes[0].value.statuses[0].status;
//     const recipientId = body_param.entry[0].changes[0].value.statuses[0].recipient_id;
//     const phoneNumberId = body_param.entry[0].changes[0].value.metadata.phone_number_id;

//         try {
          
//             const msg=await message.findOne({phone_number_id:phoneNumberId,senderId:recipientId,admin:true,status:"delivered"})
// console.log(msg);

//         if(msg && msg.wamid){

         
//             msg.status="read";

//             const success=await msg.save();
//             success && console.log("updated delivered to read:",success.content?.text&&success.content?.text);
//         }else{
//             console.log("not found in the updateStatusToRead");
            
//         }
     
//             // If saving is successful, return true
//             return true;
//         } catch (error) {
//             // If an error occurs, log it and return false
//             console.error("Error updateStatusToRead:", error);
//             return false;
//         }
// }


export async function updateStatusToRead(body_param: any): Promise<boolean> {
    console.log("updateStatus start(read)");

    const wamid = body_param.entry[0].changes[0].value.statuses[0].id;
    //const status=body_param.entry[0].changes[0].value.statuses[0].status;
    const recipientId = body_param.entry[0].changes[0].value.statuses[0].recipient_id;
    const phoneNumberId = body_param.entry[0].changes[0].value.metadata.phone_number_id;

    try {
        const userFound = await userModel.findOne({ "AppConfig.phone_number_id": phoneNumberId });
        if (userFound) {
            const userId = userFound._id.toString();


            let msgArr = await message.find({ phone_number_id: phoneNumberId, senderId: recipientId, admin: true, status: "sent" })
            console.log(msgArr);

            if (msgArr) {
                msgArr = msgArr.map((msg) => {
                    if (msg && msg.wamid) {


                        msg.status = "read";
                        msg.save()
                        return msg;
                        //    success && console.log("updated delivered to read:",success.content?.text&&success.content?.text);
                    } else {
                        console.log("not found in the updateStatusToRead");
                        return msg;
                    }

                })
                console.log("msgArr:", msgArr);
                io.to(userId).emit("updateRead", msgArr)



            }

            // If saving is successful, return true
            return true;
        } else {
            return false
        }
    } catch (error) {
        // If an error occurs, log it and return false
        console.error("Error updateStatusToRead:", error);
        return false;
    }
}