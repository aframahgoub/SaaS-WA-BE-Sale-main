import jwt ,{Secret} from "jsonwebtoken";
import {  Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const authSecret: Secret = process.env.AUTH_SECRET as Secret;

const generateToken=(
    res:Response,
    userId:mongoose.Types.ObjectId,
    email:string
)=>{
    const  token =jwt.sign({userId,email},authSecret,{
        expiresIn:"30d"
    });


     return token
}


export default generateToken;
