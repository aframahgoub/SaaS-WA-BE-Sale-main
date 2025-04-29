import { Request, RequestHandler, Response } from "express";
import userModel from "../models/user";
import generateToken from "../util/generateToken";
import { CustomRequest } from "../middleware/checkAuth";
import { BusinessInformation, getAppInfo, getAppInfo2, registerPhoneNumber, reqAccessToken, subscribeApp } from "../util/apiHandler";

export const login = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { name,email, password } = req.body;
  
      console.log(req.body);
      
      const user = await userModel.findOne({ userName: name });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
  
      // Compare passwords
      const isMatch = await user.matchPassword(password);
      if (!isMatch){

        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token=generateToken(res,user._id,user.email)
      return res.status(200).json({ message: "Login successful" ,user,token});
    } catch (error) {
      return res.status(500).json({ message: "Login failed" ,});
    }
};

export const registerUser = async (
    req: Request,
    res: Response
  ) => {
    try {
        console.log(req.body)
        const {name,email,password}=req.body;
  
      const userExist = await userModel.findOne({ userName: name });

      if(userExist){
      return  res.status(400).json({message:"user already exist"});
     }

     
  
    const user=new userModel({
        userName:name,email:email,password:password
    });

    const userCount = await userModel.estimatedDocumentCount();

    if(userCount===0){
      user.Admin=true
    }

    const created=await user.save();


    if(created){
      const token=generateToken(res,user._id,user.email)
      return  res.status(201).json({
            user,
            token
        });
        
    }else{
      return res.status(400).json({message:"user creation failed"});
    }
    } catch (error) {
      return  res.status(500).json({ message: "register failed" ,});
    }
};


export const logoutUser = async (
    req: Request,
    res: Response
  ) => {
    res.cookie("jwt","",{
        httpOnly:true,
        expires:new Date(0)
    })
    res.status(200).json({message:"logout User"})
};


export const updateEmbeddedSignUp = async (
  req: CustomRequest,
  res: Response,
) => {
  try {
    const { 
      whatsAppBusinessId,
      exchangeCode
    } = req.body;
    let phone_number_id = req.body.phone_number_id;
    console.log(req.body);
    
   const userFound=await userModel.findOne({"AppConfig.phone_number_id":phone_number_id});

   if(userFound){
    console.log("This app is already connected with a user");
    return res.status(400).json({ message: "This app is already connected with a user" });
   }

    const userId=req.user._id;
    const version="v21.0"

    const token=await reqAccessToken(exchangeCode);
    let appId=null;
    let tokenExpireTimeStamp=null;
    let phoneNumber=null;
    if(token){
      console.log(token);
      
      const data=await BusinessInformation(token);
      if(data){
        console.log(data);
        
        appId=data.app_id
        tokenExpireTimeStamp=data.expires_at
      }
      const appinfo=await getAppInfo2(token,whatsAppBusinessId);
      if(appinfo){
        console.log(appinfo.display_phone_number,", after formated:",appinfo.display_phone_number.replace(/[+\s]/g, ''));
        console.log("phoneNoId: ",appinfo.id);
        
        phoneNumber=appinfo.display_phone_number.replace(/[+\s]/g, '');
        phone_number_id=appinfo.id;

        const userFound=await userModel.findOne({"AppConfig.phone_number_id":phone_number_id});
        if(userFound){
          console.log("This app is already connected with a user");
          return res.status(400).json({ message: "This app is already connected with a user" });
         }
      }
    }

    
    const user = await userModel.findOne({_id:userId});

    if (!user) return res.status(401).json({ message: "user not found" });


    if( phoneNumber&&
        phone_number_id&&
        whatsAppBusinessId&&
        appId&&
        token&&
        tokenExpireTimeStamp&&
        version
      ){

        user.AppConfig={
          phoneNumber,
          phone_number_id,
          whatsAppBusinessId,
          appId,
          token,
          tokenExpireTimeStamp,
          version
        }
    
        const updated=await user.save()
    
        if(updated && updated.AppConfig){
    console.log(updated);

        const registered=await registerPhoneNumber(token,updated.AppConfig.phone_number_id);

        const subscribed=await subscribeApp(token,updated.AppConfig.whatsAppBusinessId);

        if(registered&&subscribed){

          return res.status(200).json({ message: "update successful" ,updated});
        }else{
          return  res.status(400).json({ message: "register No or subcribe failed" });
        }
    
        }else{
          return  res.status(400).json({ message: "update failed" });
        }

      }else{
        return res.status(400).json({ message: "parameters missing" });
      }

    
   
  } catch (error) {
    return  res.status(500).json({ message: "update failed" ,});
  }
};


export const getUsers: RequestHandler = async (req, res) => {
  try {
    
    const keyword = req.query.keyword as string;
    const search = keyword
      ? {
          userName: {
            $regex: keyword,
            $options: "i",
          },
        }
      : {};

    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await userModel.find(search).countDocuments();

    const users = await userModel
      .find(search)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({ users, count });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
