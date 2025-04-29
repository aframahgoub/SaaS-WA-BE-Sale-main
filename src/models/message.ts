import { InferSchemaType, model, Schema } from "mongoose";


const mediaSchema=new Schema({
    publicUrl:String,
    type:String,
    format:String,
    caption:String,
    
})


const contentSchema=new Schema({
    text:String,
    location:{type:{latitude:String,longitude:String}},
    image:mediaSchema,
    video:mediaSchema,
    audio:mediaSchema,
    document:mediaSchema,
    button:{payload:String,text:String},
    unsupported:Boolean
},{_id:false})


const contextSchema=new Schema({
    from:String,
    id:String,
    type:{type:String},
    content:contentSchema
},{_id:false})

const messageSchema=new Schema({
    userId:{ type: Schema.Types.ObjectId, ref: 'User'},
    wamid:{type:String,required:false},
    admin:{type:Boolean,default:false},
    senderName:{type:String,required:true},
    senderId:{type:String,required:true},
    phone_number_id:{type:String,required:true},
    type:{type:String,required:true},
    status:{type:String,
               required:true,
               enum:["sent","delivered","read","failed"],
               default:"sent"
            },
    timeStamp:{type:String,required:true},
    content:contentSchema,
    context:contextSchema

 
},{timestamps:true});

export type MessageType=InferSchemaType<typeof messageSchema>;

export default model<MessageType>("Message",messageSchema);