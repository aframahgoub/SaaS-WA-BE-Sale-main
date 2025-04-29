import { InferSchemaType, model, Schema } from "mongoose";
import { Payload } from "../util/sessions";

const sessionSchema=new Schema({
    id:{type:String,required:true,unique: true},
    phoneNumber:{type:String,required:true,unique: true},
    startTime:{ type : Date, default: Date.now },
    updatedTime:{ type : Date, default: Date.now },
    currentPath:{type:String,required:false,default:Payload.WELCOME},
    isSessionEnd:{type:Boolean,required:false,default:false},
});

type Session=InferSchemaType<typeof sessionSchema>;

export default model<Session>("Session",sessionSchema);
