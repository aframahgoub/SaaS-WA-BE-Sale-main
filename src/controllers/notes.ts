import { RequestHandler } from "express";
import conversationModel, { ChatType } from "../models/conversation";
import message, { MessageType } from "../models/message";
import {
  Config,
  sendAudioMessageUsingUrl,
  sendDocumentMessages,
  sendImgMessages,
  sendMarkAsRead,
  sendTemplateMsg,
  sendTemplateMsg2,
  sendTextMessage,
  sendVideoMessages,
} from "../util/apiHandler";
import { io } from "../server";
import groupModel from "../models/group";
import conversation from "../models/conversation";
import campaign from "../models/campaign";
import { CustomRequest } from "../middleware/checkAuth";


export const getMessages: RequestHandler = async (req, res) => {
  try {
    const { phone_no } = req.params;
    const userId = (req as CustomRequest).user._id;

    console.log(phone_no,userId);

    const notes = await conversationModel
      .find({ botPhoneNumber: phone_no, userId:userId })
      .populate("latestMessage")
      .populate("messages")
      .sort({ updatedAt: -1 });
    console.log(notes);

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const markAsReadById: RequestHandler = async (req, res) => {
  const { phone_no, sender } = req.params;
  const {wamid}=req.body;//maybe needed later
  console.log("wamid:",wamid);
  const {AppConfig:{phone_number_id,token,version}} = (req as CustomRequest).user
    const config:Config={phone_number_id,token,version};
  
    try {
      const msges=await message.findOne({wamid:wamid,admin:false,status:"sent"})
      const conversation = await conversationModel
      .findOne({
        botPhoneNumber: phone_no,
        senderPhoneNumber: sender
      })
      if(msges&&msges.wamid){
        const result=await sendMarkAsRead(config,msges.wamid);
        if(result){
          msges.status="read"
          const success=await msges.save()
          if(success&&conversation&&conversation?.unReadMsgCount){
            conversation.unReadMsgCount=conversation.unReadMsgCount-1;
            await conversation.save()
          }
        }
      }
      
      // const conversation = await conversationModel
      // .findOne({
      //   botPhoneNumber: phone_no,
      //   senderPhoneNumber: sender,
      //   unReadMsgCount: { $gt: 0 }, 
      // })
      // .populate<{ latestMessage:MessageType }>("latestMessage")
      // .populate<{ messages:MessageType[] }>({
      //   path: "messages",
      //   match: { status: "sent" }, 
      // });
      // if(conversation){
      //   //
      //   if(conversation.latestMessage && conversation.latestMessage.wamid){
  
      //     const result=await sendMarkAsRead(conversation.latestMessage.wamid);
      //     if(result){
  
          
      //       const updated=  await message.updateMany(
      //           { _id: { $in: conversation.messages.map((msg:any) => msg._id) } }, 
      //           { $set: { status: "read" } }
      //         );
             
      //      if(updated&&conversation&&conversation.unReadMsgCount){
      //       conversation.unReadMsgCount=conversation.unReadMsgCount-conversation.messages.length;
      //       conversation.save()
      //      }
      //     }
         
      //   }
  
      // }

      res.status(200).json({ success: true});
      
    } catch (error) {
      res.status(500).json(error);
    }
}

export const getMessagesById: RequestHandler = async (req, res) => {
  try {
    const { phone_no, sender } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const userId = (req as CustomRequest).user._id;

    const {AppConfig:{phone_number_id,token,version}} = (req as CustomRequest).user
    const config:Config={phone_number_id,token,version};
    // console.log('bot',phone_no,'sender',sender);
    //console.log(page,limit);
    const conversation = await conversationModel
    .findOne({
      botPhoneNumber: phone_no,
      senderPhoneNumber: sender,
      userId:userId,
      unReadMsgCount: { $gt: 0 }, 
    })
    .populate<{ latestMessage:MessageType }>("latestMessage")
    .populate<{ messages:MessageType[] }>({
      path: "messages",
      match: { status: "sent" ,admin:false}, 
    });
    if(conversation){
      //
      if(conversation.latestMessage && conversation.latestMessage.wamid){

        const result=await sendMarkAsRead(config,conversation.latestMessage.wamid);
        if(result){

        
          const updated=  await message.updateMany(
              { _id: { $in: conversation.messages.map((msg:any) => msg._id) } }, 
              { $set: { status: "read" } }
            );
           
         if(updated){
          conversation.unReadMsgCount=0;
          conversation.save()
         }
        }
       
      }

    }

    const notes = await conversationModel
      .findOne({ botPhoneNumber: phone_no, senderPhoneNumber: sender, userId:userId})
      .populate("latestMessage")
      .populate({
        path: "messages",
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
        },
      });

     


      const notesCount = await conversationModel.aggregate([
        {
          $match: {
            botPhoneNumber: phone_no,
            senderPhoneNumber: sender,
            userId:userId
          },
        },
        {
          $project: {
            messageCount: { $size: "$messages" },
          },
        },
      ]);
      
      const count = notesCount.length > 0 ? notesCount[0].messageCount : 0;
      

    // console.log({...notes,messages:notes?.messages.reverse(),totalpages:Math.ceil(notesCount / limit)});

    if (notes) {
      res
        .status(200)
        .json({
          ...notes,
          messages: notes?.messages.reverse(),
          totalpages: Math.ceil(count / limit),
        });
    } else {
      res.status(200).json({ messages: [] });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

interface csvArr {
  phoneNumber: string;
  name?: string;
  first_name?: string;
  last_name?: string;
}

export const groupCreate: RequestHandler = async (req, res) => {
  try {
    const { groupName, countryCode, contacts } = req.body;
    const { phone_no } = req.params;
    const userId = (req as CustomRequest).user._id;
    console.log(req.body);

    const isExist = await groupModel.findOne({ groupName: groupName ,userId:userId});
    if (isExist) {
      return res.status(400).json({ message: "group already exist" });
    }

    const newGroup = new groupModel({
      groupName: groupName,
      botPhoneNumber: phone_no,
      userId:userId
    });

    const allContacts = contacts.map(async (con: csvArr) => {
      const contactNumber = countryCode + con.phoneNumber;
      let contact = await conversationModel.findOne({
        senderPhoneNumber: contactNumber,
      });
      console.log(contact);

      if (!contact) {
        contact = await conversation.create({
          senderPhoneNumber: contactNumber,
          senderName: con.name,
          botPhoneNumber: phone_no,
          userId:userId
        });
      }

      newGroup.contacts.push(contact._id);
    });

    await Promise.all(allContacts);
    const created = await newGroup.save();
    console.log("newgroup", newGroup);
    console.log("created", created);

    if (created) {
      return res.status(201).json({ message: "created" });
    } else {
      return res.status(400).json({ message: "failed" });
    }
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const groupUpdate: RequestHandler = async (req, res) => {
  try {
    const { groupName, countryCode, contacts } = req.body;
    const { phone_no } = req.params;
    const userId = (req as CustomRequest).user._id;

    console.log(req.body);

    const existingGroup = await groupModel.findOne({ groupName: groupName,userId:userId });

    if (!existingGroup) {
      return res
        .status(404)
        .json({ message: `No group found with the name ${groupName}` });
    }

    existingGroup.contacts = [];

    const allContacts = contacts.map(async (con: csvArr) => {
      const contactNumber = countryCode + con.phoneNumber;

      let contact = await conversationModel.findOne({
        senderPhoneNumber: contactNumber,
        userId:userId
      });

      if (!contact) {
        // If the contact does not exist, create a new one
        contact = await conversationModel.create({
          senderPhoneNumber: contactNumber,
          senderName: con.name,
          botPhoneNumber: phone_no,
          userId:userId
        });
      }

      // Add the contact to the group's contact list
      existingGroup.contacts.push(contact._id);
    });

    // Wait for all contacts to be processed
    await Promise.all(allContacts);

    // Save the updated group
    const updatedGroup = await existingGroup.save();
    console.log("Updated Group:", updatedGroup);

    if (updatedGroup) {
      return res.status(200).json({ message: "Group updated successfully" });
    } else {
      return res.status(400).json({ message: "Group update failed" });
    }
  } catch (error) {
    console.error("Error updating group:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getGroups: RequestHandler = async (req, res) => {
  try {
    const { phone_no } = req.params;
    const userId = (req as CustomRequest).user._id;
    //console.log(phone_no);

    const groups = await groupModel
      .find({ botPhoneNumber: phone_no ,userId:userId})
      .select("-contacts");
    //console.log(notes);

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json(error);
  }
};



export const getGroupByName: RequestHandler = async (req, res) => {
  try {
    const { phone_no, groupName } = req.params;
    const userId = (req as CustomRequest).user._id;
    //console.log(phone_no);

    const group = await groupModel
      .findOne({ botPhoneNumber: phone_no, groupName: groupName,userId:userId })
      .populate("contacts");
    //console.log(notes);
    if (group) {
      res.status(200).json(group);
    } else {
      res.status(400).json({ message: "Group not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getCampaigns: RequestHandler = async (req, res) => {
  try {
    const { phone_no } = req.params;
    const userId = (req as CustomRequest).user._id;
    //console.log(phone_no);
    const keyword=req.query.keyword as string
    const search =  keyword? {
      campaignName: {
          $regex: keyword,
          $options: 'i'
      }
  } : {}

  
  const pageSize = Number(req.query.pageSize) ||10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await campaign.find({...search,botPhoneNumber: phone_no,userId:userId}).countDocuments();
  //console.log(keyword,page,pageSize);
    const campaigns = await campaign
      .find({...search, botPhoneNumber: phone_no,userId:userId })
      .skip(pageSize * (page - 1)).limit(pageSize)


    res.status(200).json({campaigns,count});
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getCampaignById: RequestHandler = async (req, res) => {
  try {
    const { phone_no, campaignId } = req.params;
    const userId = (req as CustomRequest).user._id;
    //console.log(phone_no);

    const campaignDetails = await campaign.findOne({ _id: campaignId,botPhoneNumber: phone_no,userId:userId })

    if (campaignDetails) {
      res.status(200).json(campaignDetails);
    } else {
      res.status(400).json({ message: "campaignDetails not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};


export const deleteCampaignById: RequestHandler = async (req, res) => {
  try {
    const { phone_no, campaignId } = req.params;
    const userId = (req as CustomRequest).user._id;
    //console.log(phone_no);

    const campaignDetails = await campaign.findByIdAndDelete({ _id: campaignId,botPhoneNumber: phone_no,userId:userId })

    if (campaignDetails) {
      res.status(200).json(campaignDetails);
    } else {
      res.status(400).json({ message: "campaignDetails not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const postMessage: RequestHandler = async (req, res) => {
  try {
    const { senderName, type, timeStamp, content } = req.body;
    const phone_no_id=req.body.phone_number_id
    const contextDetails=req.body.context ?? null;
    const { phone_no, sender } = req.params;
    const userId = (req as CustomRequest).user._id.toString();

    const {AppConfig:{phone_number_id,token,version}} = (req as CustomRequest).user
    const config:Config={phone_number_id,token,version};
    console.log("config:",config);
    

    console.log("body ------------------------------------start-----------");
    console.log("param", req.params);
    console.log("body", req.body);
   
   

    const conversation = await conversationModel.findOne({
      botPhoneNumber: phone_no,
      senderPhoneNumber: sender,
      userId:userId
    });

    console.log("conversation ->",conversation);
    
    if (!conversation) {
      console.log("conversation not found");
      res.status(400).json({ message: "conversation not found" });
      return;
    }

    let newmsg;

    try {

        newmsg = new message({
          //wamid:wmmidGeneration(),
          userId:userId,
          admin: true,
          senderName: senderName,
          senderId: sender,
          phone_number_id: phone_no_id,
          type: type,
          status: "sent",
          timeStamp: String(new Date().getTime()/1000),//,timeStamp,
          content: content,
        });  

        if(contextDetails){

          console.log("contextDetails:-",contextDetails);
            
          newmsg.context=contextDetails;
          console.log("newmsg:",newmsg);
        }

      
     

    } catch (error) {
      console.log("errrrrrr --- ",error);
      
    }

    let contextId:boolean|string=false;

    if(newmsg&&newmsg.context&&newmsg.context.id){
      contextId=newmsg.context.id
    }

    if (newmsg&&newmsg.content) {
      if (newmsg.type === "text" && newmsg.content.text) {
        const response=await sendTextMessage(config,newmsg.senderId, newmsg.content.text,contextId);
        if(response && typeof response ==="string"){
          newmsg.wamid=response;
        }
      } else if (newmsg.type === "image" && newmsg.content.image) {
        if (
          newmsg.content.image.caption &&
          newmsg.content.image.publicUrl
        ) {
          const response=await sendImgMessages(
            config,
            newmsg.senderId,
            newmsg.content.image.publicUrl,
            newmsg.content.image.caption,
            contextId
          );
          if(response && typeof response ==="string"){
            newmsg.wamid=response;
          }
        } else if (newmsg.content.image.publicUrl) {
          const response=await sendImgMessages(config,newmsg.senderId, newmsg.content.image.publicUrl,false,contextId);
          if(response && typeof response ==="string"){
            newmsg.wamid=response;
          }
        }
      } else if (newmsg.type === "video" && newmsg.content.video) {
        if (
          newmsg.content.video.caption &&
          newmsg.content.video.publicUrl
        ) {
          const response=await  sendVideoMessages(
            config,
            newmsg.senderId,
            newmsg.content.video.publicUrl,
            newmsg.content.video.caption,
            contextId
          );
          if(response && typeof response ==="string"){
            newmsg.wamid=response;
          }
        } else if (newmsg.content.video.publicUrl) {
          const response=await  sendVideoMessages(
            config,
            newmsg.senderId,
            newmsg.content.video.publicUrl,
            false,
            contextId
          );
          if(response && typeof response ==="string"){
            newmsg.wamid=response;
          }
        }
      } else if (
        newmsg.type === "audio" &&
        newmsg.content.audio?.publicUrl
      ) {
        const response=await sendAudioMessageUsingUrl(
          config,
          newmsg.senderId,
          newmsg.content.audio.publicUrl,
          contextId
        );
        if(response && typeof response ==="string"){
          newmsg.wamid=response;
        }
      } else if (newmsg.type === "document" && newmsg.content.document) {
        if (
          newmsg.content.document.caption &&
          newmsg.content.document.publicUrl
        ) {
          const response=await sendDocumentMessages(
            config,
            newmsg.senderId,
            newmsg.content.document.publicUrl,
            newmsg.content.document.caption,
            contextId
          );
          if(response && typeof response ==="string"){
            newmsg.wamid=response;
          }
        } else if (newmsg.content.document.publicUrl) {
          const response=await sendDocumentMessages(
            config,
            newmsg.senderId,
            newmsg.content.document.publicUrl,
            false,
            contextId
          );
          if(response && typeof response ==="string"){
            newmsg.wamid=response;
          }
        }
      } else if (newmsg.type === "template") {
        if(req.body.wamid && typeof req.body.wamid==="string"){
          newmsg.wamid=req.body.wamid;
        }
      }
    }

   

    console.log("----", newmsg);

    console.log("body ------------------------------------end-----------");

    

    if (newmsg) {
      const created=await newmsg.save()

      if(created){

      if(conversation.CSWindowTimeStamp!=="zero"){

        const current=new Date().getTime()/1000;
        const timeDi=(current-Number(conversation.CSWindowTimeStamp));
        console.log(timeDi);
       
        if(timeDi>24*60*60){
          conversation.isConversationOpen=false
        }
      }

      conversation.latestMessage = newmsg._id;
      

      conversation.messages.push(newmsg._id);

      const success = await conversation.save();
      console.log("userId of room:",userId);
      
      io.to(userId).emit("newAdminMsg", newmsg);

      if (success) {
        console.log("success:",success);
        
        
        res.status(200).json(newmsg);
      } else {
        console.log("success:",success);
        res
          .status(400)
          .json({ message: "new message push failed in conversation" });
      }
    }
    } else {
      res.status(400).json({ message: "new message push failed" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};


export const contactCreate: RequestHandler = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const { phone_no } = req.params;
    const userId = (req as CustomRequest).user._id;
    console.log(req.body);

    const isExist = await conversation.findOne({
      botPhoneNumber: phone_no,
      senderPhoneNumber: phoneNumber,
      userId:userId
    });
    if (isExist) {
      return res.status(400).json({ message: "contact already exist" });
    }

    const newContact = new conversation({
      botPhoneNumber: phone_no,
      senderPhoneNumber: phoneNumber,
      senderName: name,
      userId:userId
    });

    const created = await newContact.save();
    console.log("newContact", newContact);
    console.log("created", created);

    if (created) {
      return res.status(201).json({ message: "created" });
    } else {
      return res.status(400).json({ message: "failed" });
    }
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const contactEdit: RequestHandler = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const { phone_no ,id} = req.params;
    const userId = (req as CustomRequest).user._id;
    console.log(req.body);

    const isExist = await conversation.findOne({
      _id: id,
      botPhoneNumber: phone_no,
      userId:userId
    });
    if (!isExist) {
      return res.status(400).json({ message: "contact does not exist" });
    }

    isExist.senderName=name;
    isExist.senderPhoneNumber=phoneNumber;

    const updated = await isExist.save();
    console.log("updated contact:", updated);

    if (updated) {
      return res.status(201).json({ message: "updated" });
    } else {
      return res.status(400).json({ message: "failed" });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export interface BtnOpt{
  option:string,
  withParam:boolean
}

 export interface Additional{
  headerParams?:string
  bodyParams?:string[],
  buttonParams?:BtnOpt[]
 }

 export const sendTemplate: RequestHandler = async (req, res) => {
  try {
    const { templateJson,campaignName } = req.body;
    const additionalOptions: Additional = req.body.additionalOptions;
    const { phone_no, groupname } = req.params;
    const userId = (req as CustomRequest).user._id;

    const {AppConfig:{phone_number_id,token,version}} = (req as CustomRequest).user
    const config:Config={phone_number_id,token,version};
 
    const templateName=templateJson.template.name;
    console.log("templateName:",templateName);
    
 
    const groups = await groupModel
      .findOne({ groupName: groupname, botPhoneNumber: phone_no ,userId:userId })
      .populate<{ contacts: ChatType[] }>("contacts");
 
 
    if (!groups) {
      return res.status(400).json({ message: "Group not found" });
    }
 
 
    const responseArray: any[] = [];
    const contactsArray: any[] = [];
    let successCount=0;
    let failedCount=0;
 
 
    const allComplete = groups.contacts.map(async (con: ChatType) => {
      templateJson.to = con.senderPhoneNumber;
 
 
      if (additionalOptions.headerParams !== "custom") {
        templateJson.template.components.map((com: any) => {
          if (com.type === "header") {
            if (additionalOptions.headerParams === "contactname") {
              com.parameters[0] = {
                ...com.parameters[0],
                text: con.senderName,
              };
            } else if (additionalOptions.headerParams === "contactnumber") {
              com.parameters[0] = {
                ...com.parameters[0],
                text: con.senderPhoneNumber,
              };
            }
          }
        });
      }
 
 
      if (
        additionalOptions.bodyParams &&
        additionalOptions.bodyParams.length !== 0
      ) {
        templateJson.template.components.map((com: any) => {
          if (com.type === "body") {
            com.parameters = com.parameters.map((par: any, i: number) => {
              if (
                additionalOptions.bodyParams &&
                additionalOptions.bodyParams[i] !== "custom"
              ) {
                if (additionalOptions.bodyParams[i] === "contactname") {
                  return { ...par, text: con.senderName };
                } else if (
                  additionalOptions.bodyParams[i] === "contactnumber"
                ) {
                  return { ...par, text: con.senderPhoneNumber };
                }
              } else {
                return par;
              }
            });
          }
        });
      }
 
 
      if (
        additionalOptions.buttonParams &&
        additionalOptions.buttonParams.length !== 0
      ) {
        let index = 0;
        templateJson.template.components.map((com: any) => {
          if (com.type === "button") {
            const withParamChecker = () => {
              if (
                additionalOptions.buttonParams &&
                additionalOptions.buttonParams[index] &&
                !additionalOptions.buttonParams[index].withParam &&
                additionalOptions.buttonParams[index].option === "custom"
              ) {
                index++;
                withParamChecker();
              } else {
                return;
              }
            };
            withParamChecker();
            if (
              additionalOptions.buttonParams &&
              additionalOptions.buttonParams[index].option !== "custom"
            ) {
              if (com.sub_type === "copy_code") {
                if (
                  additionalOptions.buttonParams[index].option === "contactname"
                ) {
                  com.parameters[0].coupon_code = con.senderName;
                  index++;
                } else if (
                  additionalOptions.buttonParams[index].option ===
                  "contactnumber"
                ) {
                  com.parameters[0].coupon_code = con.senderPhoneNumber;
                  index++;
                }
              } else if (com.sub_type === "url") {
                if (
                  additionalOptions.buttonParams[index].option === "contactname"
                ) {
                  com.parameters[0].text = con.senderName;
                  index++;
                } else if (
                  additionalOptions.buttonParams[index].option ===
                  "contactnumber"
                ) {
                  com.parameters[0].text = con.senderPhoneNumber;
                  index++;
                }
              } else {
                index++;
              }
            }
          }
        });
      }
 
 
      console.log(JSON.stringify(additionalOptions, null, 2));
      console.log(JSON.stringify(templateJson, null, 2));
 
      
     
      const response = await sendTemplateMsg2(
        config,
        templateJson,
        con.senderPhoneNumber
      );
      if(response){
        successCount++
        contactsArray.push({name:con.senderName,phoneNo:con.senderPhoneNumber,success:true});
        responseArray.push(response);
      }else{
        failedCount++
        contactsArray.push({name:con.senderName,phoneNo:con.senderPhoneNumber,success:false});
      }

    });
 
 
    await Promise.all(allComplete);
    console.log(responseArray,"array")

    const campaignDetails=new campaign({
      userId:userId,
      campaignName:campaignName,
      botPhoneNumber:phone_no,
      contacts:contactsArray,
      groupName:[groupname],
      selectedTemplate:templateName,
      templateJson:templateJson,
      additionalOptions:additionalOptions,
      analytics:{
        totalSent:contactsArray.length,
        success:successCount,
        failed:failedCount
      }
    })

    await campaignDetails.save()

    console.log("campaignDetails:",campaignDetails);


    return res
      .status(201)
      .json({ message: "Successfully sent", data: responseArray });
  } catch (error) {
    console.error("Error sending bulk template:", error);
    return res.status(500).json({ message: "Server error", error });
  }
 };
 

export const sendSingleTemplate: RequestHandler = async (req, res) => {
  try {
    const { templateJson } = req.body;
    const additionalOptions: Additional = req.body.additionalOptions;
    const { phone_no, senderPhoneNumber} = req.params;
    const userId = (req as CustomRequest).user._id;

    const {AppConfig:{phone_number_id,token,version}} = (req as CustomRequest).user
    const config:Config={phone_number_id,token,version};
   
    const contact=await conversationModel.findOne({botPhoneNumber: phone_no,senderPhoneNumber:senderPhoneNumber,userId:userId})

    if(!contact){
     return res.status(400).json({ message: "contact not found" });
    }
 

        
          templateJson.to=contact.senderPhoneNumber
          if(additionalOptions.headerParams!=="custom"){
           templateJson.template.components.map((com:any)=>{
             if(com.type==="header"){
               if(additionalOptions.headerParams==="contactname"){
 
                 com.parameters[0]={...com.parameters[0],text:contact.senderName}
               }else if(additionalOptions.headerParams==="contactnumber"){
                 com.parameters[0]={...com.parameters[0],text:contact.senderPhoneNumber}
               }
             
             }
           })
          }
          if(additionalOptions.bodyParams&&additionalOptions.bodyParams.length!==0){
             templateJson.template.components.map((com:any)=>{
               if(com.type==="body"){
                com.parameters=com.parameters.map((par:any,i:number)=>{
                 if(additionalOptions.bodyParams&&additionalOptions.bodyParams[i]!=="custom"){
                   if(additionalOptions.bodyParams[i]==="contactname"){
 
                     return {...par,text:contact.senderName}
                   }else if(additionalOptions.bodyParams[i]==="contactnumber"){
                     return {...par,text:contact.senderPhoneNumber}
                   }
                 }else{
                   return par
                 }
                })
               }
             })
          }
 
          if(additionalOptions.buttonParams&&additionalOptions.buttonParams.length!==0){
           
           let index=0;
           templateJson.template.components.map((com:any)=>{
             if (com.type === "button") {
               const withParamChecker=()=>{
                 if(additionalOptions.buttonParams && additionalOptions.buttonParams[index] && !additionalOptions.buttonParams[index].withParam && additionalOptions.buttonParams[index].option === "custom"){
                   index++
                   withParamChecker()
                 }else{
                   return;
                 }
               }
               withParamChecker()
               if (additionalOptions.buttonParams && additionalOptions.buttonParams[index].option !== "custom") {
                 console.log(additionalOptions.buttonParams[index]);
                 if (com.sub_type === "copy_code") {
                   if (additionalOptions.buttonParams[index].option === "contactname") {
 
                     const toUpdate = com;
                     toUpdate.parameters[0].coupon_code = contact.senderName
                     index++
                     return toUpdate;
                   } else if (additionalOptions.buttonParams[index].option === "contactnumber") {
                     const toUpdate = com;
                     toUpdate.parameters[0].coupon_code = contact.senderPhoneNumber
                     console.log(toUpdate);
 
                     index++
                     return toUpdate;
                   }
                 }
                 else if (com.sub_type === "url") {
                   if (additionalOptions.buttonParams[index].option === "contactname") {
                     const toUpdate = com;
                     toUpdate.parameters[0].text = contact.senderName
                     index++
                     return toUpdate;
                   } else if (additionalOptions.buttonParams[index].option === "contactnumber") {
                     const toUpdate = com;
                     toUpdate.parameters[0].text = contact.senderPhoneNumber
                     console.log(toUpdate);
                     index++
                     return toUpdate;
                   }
                 } else {
                   index++
                   return com
                 }
               } else {
 
                  index++
                 return com
               }
 
             }
           })
        }
          console.log(JSON.stringify(additionalOptions,null,2));
          console.log(JSON.stringify(templateJson,null,2));
          const success=await sendTemplateMsg(config,templateJson);
         // return true
          
    
 
     if (success) {
       return res.status(201).json({ message: "successfully sent",data:success });
     } else {
       return res.status(400).json({ message: "failed to sent" });
     }
   } catch (error) {
     console.error("Error sending bulk template:", error);
     return res.status(500).json({ message: "Server error", error });
   }
};

export const retryTemplate: RequestHandler = async (req, res) => {
  try {
    const { templateJson } = req.body;
    const additionalOptions: Additional = req.body.additionalOptions;
    const { phone_no, senderPhoneNumber,campaignId} = req.params;
    const userId = (req as CustomRequest).user._id;

    const {AppConfig:{phone_number_id,token,version}} = (req as CustomRequest).user
    const config:Config={phone_number_id,token,version};

    const contact=await conversationModel.findOne({botPhoneNumber: phone_no,senderPhoneNumber:senderPhoneNumber,userId:userId})
    const campaignDetails=await campaign.findById(campaignId);

    if(!contact||!campaignDetails){
     return res.status(400).json({ message: "contact or campaign not found" });
    }
 
    const contactsfromCampaign = campaignDetails.contacts.find(
      (c) => c.phoneNo === senderPhoneNumber
    );

    if (!contactsfromCampaign) {
      console.error('Contact not found in camapaign');
      return;
    }


        
          templateJson.to=contact.senderPhoneNumber
          if(additionalOptions.headerParams!=="custom"){
           templateJson.template.components.map((com:any)=>{
             if(com.type==="header"){
               if(additionalOptions.headerParams==="contactname"){
 
                 com.parameters[0]={...com.parameters[0],text:contact.senderName}
               }else if(additionalOptions.headerParams==="contactnumber"){
                 com.parameters[0]={...com.parameters[0],text:contact.senderPhoneNumber}
               }
             
             }
           })
          }
          if(additionalOptions.bodyParams&&additionalOptions.bodyParams.length!==0){
             templateJson.template.components.map((com:any)=>{
               if(com.type==="body"){
                com.parameters=com.parameters.map((par:any,i:number)=>{
                 if(additionalOptions.bodyParams&&additionalOptions.bodyParams[i]!=="custom"){
                   if(additionalOptions.bodyParams[i]==="contactname"){
 
                     return {...par,text:contact.senderName}
                   }else if(additionalOptions.bodyParams[i]==="contactnumber"){
                     return {...par,text:contact.senderPhoneNumber}
                   }
                 }else{
                   return par
                 }
                })
               }
             })
          }
 
          if(additionalOptions.buttonParams&&additionalOptions.buttonParams.length!==0){
           
           let index=0;
           templateJson.template.components.map((com:any)=>{
             if (com.type === "button") {
               const withParamChecker=()=>{
                 if(additionalOptions.buttonParams && additionalOptions.buttonParams[index] && !additionalOptions.buttonParams[index].withParam && additionalOptions.buttonParams[index].option === "custom"){
                   index++
                   withParamChecker()
                 }else{
                   return;
                 }
               }
               withParamChecker()
               if (additionalOptions.buttonParams && additionalOptions.buttonParams[index].option !== "custom") {
                 console.log(additionalOptions.buttonParams[index]);
                 if (com.sub_type === "copy_code") {
                   if (additionalOptions.buttonParams[index].option === "contactname") {
 
                     const toUpdate = com;
                     toUpdate.parameters[0].coupon_code = contact.senderName
                     index++
                     return toUpdate;
                   } else if (additionalOptions.buttonParams[index].option === "contactnumber") {
                     const toUpdate = com;
                     toUpdate.parameters[0].coupon_code = contact.senderPhoneNumber
                     console.log(toUpdate);
 
                     index++
                     return toUpdate;
                   }
                 }
                 else if (com.sub_type === "url") {
                   if (additionalOptions.buttonParams[index].option === "contactname") {
                     const toUpdate = com;
                     toUpdate.parameters[0].text = contact.senderName
                     index++
                     return toUpdate;
                   } else if (additionalOptions.buttonParams[index].option === "contactnumber") {
                     const toUpdate = com;
                     toUpdate.parameters[0].text = contact.senderPhoneNumber
                     console.log(toUpdate);
                     index++
                     return toUpdate;
                   }
                 } else {
                   index++
                   return com
                 }
               } else {
 
                  index++
                 return com
               }
 
             }
           })
        }
          console.log(JSON.stringify(additionalOptions,null,2));
          console.log(JSON.stringify(templateJson,null,2));
          const success=await sendTemplateMsg(config,templateJson);
         // return true
          
    
 
     if (success) {
      contactsfromCampaign.success = true;

      await campaignDetails.save();
      
       return res.status(201).json({ message: "successfully sent",data:success });
     } else {
       return res.status(400).json({ message: "failed to sent" });
     }
   } catch (error) {
     console.error("Error sending bulk template:", error);
     return res.status(500).json({ message: "Server error", error });
   }
};