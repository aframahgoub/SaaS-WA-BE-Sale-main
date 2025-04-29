import jwt ,{Secret} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import userModel from "../models/user";

const authSecret: Secret = process.env.AUTH_SECRET as Secret;

export interface CustomRequest extends Request {
    user?: any; // Replace `any` with the actual type of your user object if known
  }

export const protect = async (
    req: CustomRequest ,
    res: Response,
    next: NextFunction
  ) => {
  

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'token missing' })
  }

  try {
    const decoded = jwt.verify(token, authSecret) as {email: string,userId: string};
    const userId = decoded.userId;
    const user = await userModel.findOne({ _id: userId }).exec();
    if (!user) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }

    req.user= user
   // console.log(req.user)
    if (user) {
      next();
    } else {
      res.status(404).json({ message: "User not found" });
    }

  } catch (err) {
    return res.status(400).json({ error: 'token invalid' })
  }
};


export const isAdmin =async (
  req: CustomRequest ,
  res: Response,
  next: NextFunction
) => {
  const adminUser =req.user;
  if (adminUser && adminUser.isAdmin) {
  return res.status(400).json({ message: "You are not an admin" });
  } else {
  next();
  }
  }