import { InferSchemaType, model, Schema } from "mongoose";

const groupSchema=new Schema({
    userId:{ type: Schema.Types.ObjectId, ref: 'User'},
    groupName:{type:String,required:true},
    botPhoneNumber:{type:String,required:true},
    contacts:[{ type: Schema.Types.ObjectId, ref: 'Chat'}],
   
},{timestamps:true});

export type GroupType=InferSchemaType<typeof groupSchema>;

export default model<GroupType>("Group",groupSchema);