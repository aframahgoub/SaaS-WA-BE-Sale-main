import { InferSchemaType, model, Schema } from "mongoose";

const Additional=new Schema({
    headerParams:String,
    bodyParams:[String],
    buttonParams:[{
        option:String,
        withParam:Boolean
      }]
   },{_id:false})

const campaignSchema=new Schema({
    userId:{ type: Schema.Types.ObjectId, ref: 'User'},
    campaignName:{type:String,required:true},
    botPhoneNumber:{type:String,required:true},
    contacts:[{ name:String ,phoneNo:String,success:Boolean}],
    groupName:[{type:String,required:true}],
    selectedTemplate:{type:String,required:true},
    templateJson:{type:Schema.Types.Mixed,required:true},
    additionalOptions:{type:Additional,required:true},
    analytics:{
        totalSent:Number,
        success:Number,
        failed:Number
    }
   
},{timestamps:true});

export type CampaignType=InferSchemaType<typeof campaignSchema>;

export default model<CampaignType>("Campaign",campaignSchema);