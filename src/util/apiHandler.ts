import env from "../util/validateEnv";
import axios from "axios";
import { CloudinaryUploadResult, DeleteMediaResponse, errorMediaResponse, ErrorResponse, mediaResponse } from "./types";
import fs from 'fs';
import FormData from 'form-data';
import cloudinary from "./cloudinary";
// import { f } from "../uploadthing";



const version=env.VERSION;
// const phone_number_id=env.PHONE_NO_ID;

export interface Config{
  token:string,
  version:string,
  phone_number_id:string
}


//# This is for sending Text Messages
export async function sendTextMessage(config:Config,to: string,msg:string,contextId:boolean|string=false): Promise<boolean|string> {
    try {
      const {token,phone_number_id} = config;

      console.log("contextId in textMessage:",contextId);
      
        // Make the Axios request to send the message
       const msgBody:any={
        messaging_product: "whatsapp",
        to: to,
        text:{
            body:""+msg
        }
       }

       if(contextId){
        msgBody.context={message_id:contextId}
       }
       const response= await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, msgBody, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("testMsgResponse:", response.data);
        // If the request is successful, return true
        if(response.status===200){
          return response.data.messages[0].id;
        }else{
          return false;
        }
    } catch (error) {
        // If an error occurs, log it and return false
        console.error("Error sending message:", error);
        return false;
    }
}

export async function sendTemplateMsg(config:Config,templateJson:any): Promise<any> {
  try {
    const {token,phone_number_id} = config;
      // Make the Axios request to send the message
      const response=await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, templateJson, {
          headers: {
              "Content-Type": "application/json",
          },
      });
      console.log("templateResponse:",response.data);
      if(response.status===200){
        return {
          wamid:response.data.messages[0].id,
          senderName: "bot",
          phone_number_id: phone_number_id,
          type: "template",
          timeStamp: String(new Date().getTime()/1000),
          content: {
              text:"template sent success"
          }
         };
      }else{
        return false
      }
      // If the request is successful, return true
     
  } catch (error:any) {
      // If an error occurs, log it and return false
      console.error("Error sending template message:", error.message);
      return false;
  }
}

export async function sendTemplateMsg2(config:Config,templateJson: any,senderPhoneNumber:string): Promise<any> {
  try {
    const {token,phone_number_id} = config;
    // Make the Axios request to send the message
    const response = await axios.post(
      `https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`,
      templateJson,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("templateResponse:", response.data);
    if (response.status===200) {
      return {
        wamid:response.data.messages[0].id,
        senderName: "bot",
        senderPhoneNumber:senderPhoneNumber,
        phone_number_id: phone_number_id,
        type: "template",
        timeStamp: String(new Date().getTime() / 1000),
        content: {
          text: "template sent success",
        },
      };
    } else {
      return false;
    }
    // If the request is successful, return true
  } catch (error) {
    // If an error occurs, log it and return false
    console.error("Error sending template message:", error);
    return false;
  }
 }
 
export async function sendImageMessageUsingURL(config:Config,to: string,imgLink:string): Promise<boolean> {
  try {
    const {token,phone_number_id} = config;
      // Make the Axios request to send the message
       const response=await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, {
          messaging_product: "whatsapp",
          to: to,
          type:"image",
          image: {
              link: imgLink,
          }
      }, {
          headers: {
              "Content-Type": "application/json",
          },
      });

      if(response.status===200){
        return response.data.messages[0].id;
      }else{
        return false;
      }
  } catch (error) {
      // If an error occurs, log it and return false
      console.error("Error sending message:", error);
      return false;
  }
}

export async function sendImgMessages(config:Config,to: string,publicUrl:string,caption:string|boolean=false,contextId:boolean|string=false){
  try {
    const {token,phone_number_id} = config;
      console.log('sending image message started');
      console.log('got public url------->',publicUrl);

      const body:any={
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "image",
        image: {
          link :publicUrl
          
        }
      }
      if(caption){
        body.image.caption=caption
      }
      if(contextId){
        body.context={message_id:contextId}
       }
      // Make the Axios request to send the message
      const success=await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, body, {
          headers: {
              "Content-Type": "application/json",
          },
      });
      
      if(success.status===200){
        return success.data.messages[0].id;
      }else{
        return false;
      }

      
  } catch (error) {
      // If an error occurs, log it and return false
      console.error("Error sending ImgMessages:", error);
      return false;
  }
}

export async function sendVideoMessages(config:Config,to: string,publicUrl:string,caption:string|boolean=false,contextId:boolean|string=false){
  try {
    const {token,phone_number_id} = config;
      console.log('sendVideoMessages started');
      console.log('got public url------->',publicUrl);

      const body:any={
        messaging_product: "whatsapp",
        to: to,
        type:"video",
        video: {
            link: publicUrl,
        }
     }
      if(caption){
        body.video.caption=caption
      }
      if(contextId){
        body.context={message_id:contextId}
       }
      // Make the Axios request to send the message
      const success=await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, body, {
          headers: {
              "Content-Type": "application/json",
          },
      });
      if(success.status===200){
        return success.data.messages[0].id;
      }else{
        return false;
      }

      
  } catch (error) {
      // If an error occurs, log it and return false
      console.error("Error sendVideoMessages:", error);
      return false;
  }
}

export async function sendDocumentMessages(config:Config,to: string,publicUrl:string,caption:string|boolean=false,contextId:boolean|string=false){
  try {
    const {token,phone_number_id} = config;
      console.log('sendDocumentMessages started');
      console.log('got public url------->',publicUrl);

      const body:any={
        messaging_product: "whatsapp",
        to: to,
        type:"document",
        document: {
            link: publicUrl,
        }
     }
      if(caption){
        body.document.caption=caption
      }
      if(contextId){
        body.context={message_id:contextId}
       }
      // Make the Axios request to send the message
      const success=await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, body, {
          headers: {
              "Content-Type": "application/json",
          },
      });
      if(success.status===200){
        return success.data.messages[0].id;
      }else{
        return false;
      }

      
  } catch (error) {
      // If an error occurs, log it and return false
      console.error("Error sendDocumentMessages:", error);
      return false;
  }
}


export async function sendAudioMessageUsingUrl(config:Config,to: string,audioUrl:string,contextId:boolean|string=false): Promise<boolean> {
  try {
    const {token,phone_number_id} = config;
      const body:any={
        messaging_product: "whatsapp",
        to: to,
        type:"audio",
        audio: {
            link: audioUrl,
        }
      }
      if(contextId){
        body.context={message_id:contextId}
       }

      // Make the Axios request to send the message
      const response=await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, body, {
          headers: {
              "Content-Type": "application/json",
          },
      });
      if(response.status===200){
        return response.data.messages[0].id;
      }else{
        return false;
      }
  } catch (error) {
      // If an error occurs, log it and return false
      console.error("Error sending message:", error);
      return false;
  }
}

export async function sendVideoMessageUsingURL(config:Config,to: string,videoLink:string): Promise<boolean> {
  try {
    const {token,phone_number_id} = config;
      // Make the Axios request to send the message
      await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, {
          messaging_product: "whatsapp",
          to: to,
          type:"video",
          video: {
              link: videoLink,
          }
      }, {
          headers: {
              "Content-Type": "application/json",
          },
      });

      // If the request is successful, return true
      return true;
  } catch (error) {
      // If an error occurs, log it and return false
      console.error("Error sending message:", error);
      return false;
  }
}

//# This is for sending Text Messages
export async function sendMarkAsRead(config:Config,MsgId: string): Promise<boolean> {
    try {
      const {token,phone_number_id} = config;
        // Make the Axios request to send the message
       const response= await axios.post(`https://graph.facebook.com/${version}/${phone_number_id}/messages?access_token=${token}`, {
            messaging_product: "whatsapp",
            status: "read",
            message_id: MsgId
            }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("response from fetch markasread:",response.data);
        
        if(response.data.success){
          return true;
        }else{
          return false;
        }
        // If the request is successful, return true
       
    } catch (error) {
        // If an error occurs, log it and return false
        console.error("Error sending message:", error);
        return false;
    }
}


//media messages
export async function uploadMediaFile(userConfig:Config,filePath: string): Promise<any> {
  const {token,phone_number_id} = userConfig;
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', fs.createReadStream(filePath));
  
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://graph.facebook.com/${version}/${phone_number_id}/media`,
      headers: {
        'Authorization': 'Bearer ' +token,
        'Cookie': 'ps_l=1; ps_n=1',
        'content-type': 'multipart/form-data',
        ...formData.getHeaders()
      },
      data: formData
    };
  
    try {
      const response = await axios.request(config);
      console.log(response.data);
      return response.data;

    } catch (error) {
      console.log(error);
      return error;
    }
}

export const formatName=(name:string)=>{
  console.log(name);
  
  return name
  .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric except `.` and `-`
  .replace(/_+/g, '_')            // Collapse multiple underscores into one
  .replace(/^_|_$/g, '');         // Trim leading and trailing underscores
}

export async function cloudinaryUploadImg(file:any): Promise<any> {
 
  console.log(file);
  const options :any= {
    resource_type: 'auto',
    public_id:formatName(file.originalname.trim()).split('.')[0]
  };
console.log("file name:",formatName(file.originalname.trim()).split('.')[0]);

  
  if (file.mimetype.startsWith("video/")) {
    options.resource_type = "video";
    options.format = "mp4"; 
    options.transformation = [
      { width: 1280, height: 720, crop: "limit" },
      { video_codec: "h264" },
      { audio_codec: "aac" },
      { quality: "auto" }
    ];
  } else if (file.mimetype.startsWith("audio/")) {
   
    options.resource_type = "video"; 
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
  
  console.log("fileExtension:--",fileExtension);
  
  
    options.format = fileExtension; 
    options.transformation = [
      { quality: "auto" }     
    ];

    if (fileExtension === "ogg"||fileExtension === "opus") {
      // Use Opus codec for OGG files
      options.transformation.push({ audio_codec: "opus" });
    }
  
  }
  
  try {
    
    const result =await cloudinary.uploader.upload(file.path,options)
    console.log("fromcloudinary",result);
    return result;

  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getMediaURLFromMediaID(config:Config,mediaId: string): Promise<mediaResponse|errorMediaResponse> {
    try {
      const {token,phone_number_id} = config;
        const response = await axios.get(`https://graph.facebook.com/${version}/${mediaId}`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
         });

         // Check if the response contains the expected fields
        if ('url' in response.data) {
            return response.data as mediaResponse;
        } else {
            return { error: "Unexpected response format" };
        }

    } catch (error) {
        // If an error occurs, log it and return a structured error response
        console.error("Error getting media link:", error);

        // Type assertion for AxiosError
        if (axios.isAxiosError(error)) {
            return { error: error.response?.data?.error || "Media not found" };
        } else {
            return { error: "An unknown error occurred" };
        }
    }
}

  //getMediaURLFromMediaURL
export async function downloadMediaFromURL(config:Config,mediaUrl: string): Promise<any> {
    try {
      const {token,phone_number_id} = config;
        const mediaResponse = await axios.get(mediaUrl, {
          headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${token}`
          },
          responseType: 'arraybuffer',
          responseEncoding: 'binary'
  
      });
  
      console.log("data # ",mediaResponse.data);
      return mediaResponse.data;
  
      } catch (error) {
         // If an error occurs, log it and return a server error
         console.error('Error downloadMediaFromURL ', error);
         return error;
      }
}



type DeleteMediaResult = DeleteMediaResponse | ErrorResponse;

export async function deleteMediaUsingId(config:Config,mediaId: string): Promise<DeleteMediaResult> {
    try {
      const {token,phone_number_id} = config;
        const response = await axios.delete(`https://graph.facebook.com/${version}/${mediaId}`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
        });

        console.log("data # ", response.data);
        return response.data as DeleteMediaResponse;

    } catch (error) {
        // If an error occurs, log it and return a structured error response
        console.error('Error deleting media:', error);

        // Type assertion for AxiosError
        if (axios.isAxiosError(error)) {
            return { error: error.response?.data?.error || 'Failed to delete media' };
        } else {
            return { error: 'An unknown error occurred' };
        }
    }
}


export const getImageById=async(config:Config,id:string)=>{
  const {token,phone_number_id} = config;
    function isBinary(data:unknown) {
        if (!(data instanceof Buffer)) {
          return false; // Not a Buffer
        }
      
        // Check if the buffer contains any null bytes, which are common in binary data
        return data.includes(0x00);
      }
    try {
        // Make the Axios request to send the message
        console.log('getting image url proccess started');
        

        const imgIdresponse=await axios.get(`https://graph.facebook.com/${version}/${id}`,{
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
        });

        if(imgIdresponse.data){
        console.log('got url from sending id success');
        

        const {url,mime_type,sha256,id}=imgIdresponse.data;
        
        
        const response2=await axios.get(url,{
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        });

    //     const filePath = path.resolve(__dirname, 'image1.jpg'); // Define the file path
    //    fs.writeFileSync(filePath, response2.data); // Write the binary data to a file

        if(response2){
            console.log('got binary form image by url');

              const binaryData = Buffer.from(response2.data);
              console.log(isBinary(binaryData)); // true

              


              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const uploadToCloudinary = (data:Buffer): Promise<CloudinaryUploadResult| any> => {
                return new Promise((resolve, reject) => {
                  const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image' },
                    (error, result) => {
                      if (error) {
                        reject(error);
                      } else {
                        console.log('cloudinary upload successfull');
                        resolve(result);
                      }
                    }
                  );
                  uploadStream.end(data);
                });
              };

          
              // Upload the binary data to Cloudinary
              const result = await uploadToCloudinary(response2.data);

            //   const uploadRouter = {
            //     imageUploader: f({
            //       image: {
            //         maxFileSize: "8MB",
            //         maxFileCount: 4,
            //       },
            //     }).onUploadComplete((data) => {
            //       console.log("upload completed", data);
            //     }),
            //   } 
              
              if(result){

                console.log(result);
                

                const img={
                    //imgId:id,
                    //publicId:result.public_id,
                    publicUrl:result.secure_url,
                    type:result.type,
                    //mime_type:mime_type,
                    //sha256:sha256
                    }
    
    
                return img
              }
              
        }

    }

       
    } catch (error) {
        // If an error occurs, log it and return false
        console.error("Error sending image--------------:", error);
        return false;
    }

}



export const getMediaById = async (config:Config,id: string) => {
  const {token,phone_number_id} = config;
  function isBinary(data: unknown) {
    if (!(data instanceof Buffer)) {
      return false; // Not a Buffer
    }

    // Check if the buffer contains any null bytes, which are common in binary data
    return data.includes(0x00);
  }
  try {
    // Make the Axios request to send the message
    console.log("getting video url proccess started");

    const imgIdresponse = await axios.get(
      `https://graph.facebook.com/${version}/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (imgIdresponse.data) {
      console.log("got url from sending id success");

      const { url, mime_type, sha256, id } = imgIdresponse.data;
      console.log(imgIdresponse.data);
      

      const response2 = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        responseType: "arraybuffer",
        responseEncoding: "binary",
      });

      //     const filePath = path.resolve(__dirname, 'image1.jpg'); // Define the file path
      //    fs.writeFileSync(filePath, response2.data); // Write the binary data to a file

      if (response2) {
        console.log("got binary form video by url");

        const binaryData = Buffer.from(response2.data);
        console.log(isBinary(binaryData)); // true
        const options :any= {
          resource_type: 'auto',
        };
      
        
        if (imgIdresponse.data.mime_type==="video/3gpp") {
          options.resource_type = 'video'; // Use 'video' for mp4 format
          options.format = 'mp4'; // Convert 3gp to mp4
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadToCloudinary = (
          data: Buffer
        ): Promise<CloudinaryUploadResult | any> => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              options,
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  console.log("cloudinary upload successfull");
                  resolve(result);
                }
              }
            );
            uploadStream.end(data);
          });
        };

        // Upload the binary data to Cloudinary
        const result = await uploadToCloudinary(response2.data);

        //   const uploadRouter = {
        //     imageUploader: f({
        //       image: {
        //         maxFileSize: "8MB",
        //         maxFileCount: 4,
        //       },
        //     }).onUploadComplete((data) => {
        //       console.log("upload completed", data);
        //     }),
        //   }

        if (result) {
          console.log(result);

          const video = {
            //imgId:id,
            //publicId:result.public_id,
            publicUrl: result.secure_url,
            type: result.resource_type,
            format:result.format
            //mime_type:mime_type,
            //sha256:sha256
          };

          return video;
        }
      }
    }
  } catch (error) {
    // If an error occurs, log it and return false
    console.error("Error sending video--------------:", error);
    return false;
  }
};

export const getFileById = async (config:Config,id: string,filename:string) => {
  const {token,phone_number_id} = config;
  function isBinary(data: unknown) {
    if (!(data instanceof Buffer)) {
      return false; // Not a Buffer
    }

    // Check if the buffer contains any null bytes, which are common in binary data
    return data.includes(0x00);
  }
  try {
    // Make the Axios request to send the message
    console.log("getting video url proccess started");

    const imgIdresponse = await axios.get(
      `https://graph.facebook.com/${version}/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (imgIdresponse.data) {
      console.log("got url from sending id success");

      const { url, mime_type, sha256, id } = imgIdresponse.data;
      console.log(imgIdresponse.data);
      console.log(filename);
      
      
   

      const response2 = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        responseType: "arraybuffer",
        responseEncoding: "binary",
      });

      //     const filePath = path.resolve(__dirname, 'image1.jpg'); // Define the file path
      //    fs.writeFileSync(filePath, response2.data); // Write the binary data to a file

      if (response2) {
        console.log("got binary form video by url");

        const binaryData = Buffer.from(response2.data);
        console.log(isBinary(binaryData)); // true

        const options :any= {
          resource_type: 'raw',
          public_id:formatName(filename.trim())
        };
      
        // If the file is audio, set the format to mp4
        // if (filename.endsWith('.pdf')) {
          
        //   options.resource_type = 'image'; // Use 'video' for mp4 format
        //   options.format = 'pdf'; // Convert audio to mp4
        // }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadToCloudinary = (
          data: Buffer
        ): Promise<CloudinaryUploadResult | any> => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              options,
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  console.log("cloudinary upload successfull");
                  resolve(result);
                }
              }
            );
            uploadStream.end(data);
          });
        };

        

        // Upload the binary data to Cloudinary
        const result = await uploadToCloudinary(response2.data);

        //   const uploadRouter = {
        //     imageUploader: f({
        //       image: {
        //         maxFileSize: "8MB",
        //         maxFileCount: 4,
        //       },
        //     }).onUploadComplete((data) => {
        //       console.log("upload completed", data);
        //     }),
        //   }

        if (result) {
          console.log(result);

          const video = {
            //imgId:id,
            //publicId:result.public_id,
            publicUrl: result.secure_url,
            type: result.resource_type,
            format:result.format
            //mime_type:mime_type,
            //sha256:sha256
          };

          return video;
        }
      }
    }
  } catch (error) {
    // If an error occurs, log it and return false
    console.error("Error sending video--------------:", error);
    return false;
  }
};


export const reqAccessToken = async (code: string) => {
  const url = `https://graph.facebook.com/${version}/oauth/access_token`;

  const params = new URLSearchParams({
    client_id: "1158808448664834",
    client_secret: "56b4488775014ea0e52a9ba6ffa5aac8",
    code,
    // redirect_uri: "https://localhost:5173/",
    grant_type: "authorization_code",
  });

  const response = await fetch(`${url}?${params}`, { method: "GET" });
  const data = await response.json();
  console.log(data);
  return data.access_token
};


export const BusinessInformation = async(token:any)=>{
  // const url = `https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}`;
 const SYSTEM_ACCESS_TOKEN =process.env.SYSTEM_ACCESS_TOKEN;
  const url =   `https://graph.facebook.com/${version}/debug_token?input_token=${token}&access_token=${SYSTEM_ACCESS_TOKEN}`
   const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Authorization: Bearer ${token},
    },
    method: "GET",
  });

    const data = await response.json();
    if (data) {
      return data.data
    } else {
      return null;
    }
}

export const getAppInfo = async(token:any,bussinessId:string)=>{

 const url = `https://graph.facebook.com/${version}/${bussinessId}?fields=phone_numbers&access_token=${token}`;

   const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Authorization: Bearer ${token},
    },
    method: "GET",
  });

    const data = await response.json();
    if (data) {
      return data.phone_numbers.data[0]
    } else {
      return null;
    }
}

export const getAppInfo2 = async(token:any,bussinessId:string)=>{

  const url = `https://graph.facebook.com/${version}/${bussinessId}/phone_numbers?access_token=${token}&sort=['last_onboarded_time_ascending']`;
 
    const response = await fetch(url, {
     headers: {
       Accept: "application/json",
       // Authorization: Bearer ${token},
     },
     method: "GET",
   });
 
     const data = await response.json();
     if (data) {
       return data.data[0]
     } else {
       return null;
     }
 }

export const registerPhoneNumber = async(token:any,phoneNoId:string)=>{
  const url = `https://graph.facebook.com/${version}/${phoneNoId}/register?access_token=${token}`;
 
    const response = await fetch(url, {
     headers: {
       "Content-Type": "application/json",
       // Authorization: Bearer ${token},
     },
     method: "POST",
     body:JSON.stringify({
      "messaging_product": "whatsapp", 
      "pin": "212834" 
     })
   });
 
     const data = await response.json();
     if (data) {
      console.log(data);
      
       return data
     } else {
       return null;
     }
}

export const subscribeApp = async(token:any,bussinessId:string)=>{
  
  const url = `https://graph.facebook.com/${version}/${bussinessId}/subscribed_apps`;
 
    const response = await fetch(url, {
     headers: {
       Authorization: `Bearer ${token}`,
     },
     method: "POST",
   });
 
     const data = await response.json();
     if (data) {
      console.log(data);
       return data
     } else {
       return null;
     }
 }