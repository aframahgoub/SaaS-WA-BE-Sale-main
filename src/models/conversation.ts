import { InferSchemaType, model, Schema } from "mongoose";

const conversationSchema=new Schema({
    userId:{ type: Schema.Types.ObjectId, ref: 'User'},
    botPhoneNumber:{type:String,required:true},
    senderPhoneNumber:{type:String,required:true},
    messages:[{ type: Schema.Types.ObjectId, ref: 'Message'}],
    latestMessage:{ type: Schema.Types.ObjectId, ref: 'Message'},
    senderName:{type:String},
    isConversationOpen:{type:Boolean,default:false},
    CSWindowTimeStamp:{type:String,required:false,default:"zero"},
    unReadMsgCount:{type:Number,required:false,default:0}

},{timestamps:true});

export type ChatType=InferSchemaType<typeof conversationSchema>;

export default model<ChatType>("Chat",conversationSchema);