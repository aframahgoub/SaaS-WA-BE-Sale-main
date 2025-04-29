import env from "../util/validateEnv";
import { RequestHandler } from "express";
import sessionModel from "../models/session";
import { audioMesssgeCheck, documentMesssgeCheck, imageMesssgeCheck, messagesCheck, payloadCheck, statusCheck, textMesssgeCheck, videoMesssgeCheck } from "../util/messageValidation";
import {sendMarkAsRead, sendTextMessage } from "../util/apiHandler";
import { pushTextMessage, updateStatusToDelivered, updateStatusToRead } from "../util/dbHandler";


const verify_token=env.VERIFY_TOKEN;
// const phoneNoId=env.PHONE_NO_ID;


//# This is Trigger, when you go to the the Project's BASE_URL 
export const checkWebhook:RequestHandler=async (req, res) => {
    res.status(200).send("Hello! This is a webhook setup!");
};

//# This is for verifying the Callback URL 
//# This will trigger, once you entered - Callback URL and verify_token
//# 1. BASE_URL + webhook = https://www.BASE_URL/webhook
//# 2. verify_token = apple
//# Check the Doc  - 
export const vertifyWebhook:RequestHandler=async (req, res) => {

    // const verify_token=req.params.phone_no_id;
    

    const mode=req.query["hub.mode"];
    const challange=req.query["hub.challenge"];
    const token=req.query["hub.verify_token"];

    // console.log("verify_token from webhook params:",verify_token);
    console.log("verify_token from token in request:",token);


    if(mode && token){

        if(mode==="subscribe" && token===verify_token){
            res.status(200).send(challange);
        }else{
            res.status(403);
        }

    }
    console.log("hello this is webhook setup");
};


//# This is will trigger, whatevever the changes happens in the Chat
//# All the Bot related Business logic will come here!
export const listenWebhook:RequestHandler=async (req, res) => {
   

    const body_param=req.body;
    
    //  const {phone_no_id}=req.params;

    //  console.log("phone_no_id from webhook params:",phone_no_id);
     

   

        
        if(body_param.object){

        //    if(body_param.entry[0].changes[0].value.metadata?.phone_number_id===phone_no_id){
                console.log("# Listening Webhook event #");
                console.log(JSON.stringify(body_param,null,2));
            //# message's value
            //# to get the Response value from Webhook
            if(messagesCheck(body_param)){
                   console.log("# message event #")
                //    console.log(JSON.stringify(body_param,null,2));
    
                   const phon_no_id=body_param.entry[0].changes[0].value.metadata?.phone_number_id;
                   const phone_no = body_param.entry[0].changes[0].value.messages[0].from; 
                   const message_id=body_param.entry[0].changes[0].value.messages[0].id;
                   const messageType= body_param.entry[0].changes[0].value.messages[0].type

                   if(messageType==="unsupported"){
                    return res.sendStatus(200);
                   }
                  
                   console.log("phone number "+phon_no_id);
                   console.log("from "+phone_no);
                   console.log("message id  "+message_id);
    
                   //find the message type
                   //store it in mongo db
                   if(textMesssgeCheck(body_param)||imageMesssgeCheck(body_param)||videoMesssgeCheck(body_param)||audioMesssgeCheck(body_param)||documentMesssgeCheck(body_param)||payloadCheck(body_param)){
                    //
                     if(await pushTextMessage(body_param)){
                    //    const text=body_param.entry[0].changes[0].value.messages[0].text.body
                    //     sendTextMessage(phone_no,text)
                     }
                    }else{
                        console.log("unsupported type -------",body_param.entry[0].changes[0].value.messages[0].type);
                        pushTextMessage(body_param,true)
                    }
                    
                //    else if (){
                //     if (await pushTextMessage(body_param)){
                //         //
                //     }
                //    }
                     // wamid.HBgLOTQ3NjMyMjc4MDcVAgARGBJFQzk5NzQxMkNCRjdBNTc5NjEA
    
                    // sendMarkAsRead(message_id);  
                 // for marking read every messages we received
                //    sendMarkAsRead(message_id);  
            //# message's status
            //# SENT | DELIVERED | SEEN 
            }else if(statusCheck(body_param)){
                  console.log("# message status event check #")
                  const wamid=body_param.entry[0].changes[0].value.statuses[0].id;
                  const status=body_param.entry[0].changes[0].value.statuses[0].status;
                  //console.log("status----------",JSON.stringify(body_param,null,2));
                //   const recipientId = body_param.entry[0].changes[0].value.statuses[0].recipient_id;
                //   const phoneNumberId = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                  
                  if(status==="sent"){

                   //
                      
                      console.log("sent__messageid----------",wamid);
                  }else if(status==="delivered"){

                    // if(await updateStatusToDelivered(body_param)){
                    //     //this messages are from saaswa so it already have status "sent" when comming to this
                    //    //but we don't have wamid so we update it here and status to delivered
                    //    // 
                        
                    // }
    
                      
                    console.log("delivered__messageid----------",wamid);

                  }else if(status==="read"){

                    if(await updateStatusToRead(body_param)){
                        
                       // here we updating status to read with this function saaswa can change it's double tick into blue color
                        
                    }
                      
                    console.log("read__messageid----------",wamid);
                  }
                  
                  
                        
            }

    //    }
    
            res.sendStatus(200);
        }else{
            console.log("# not required webhook event! #")
            res.sendStatus(404);
        }
        
    


};