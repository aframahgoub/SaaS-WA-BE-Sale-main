import { InferSchemaType, model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema=new Schema({
    userName:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},

    AppConfig:{type:{
        phoneNumber:{type:String,required:true},
        phone_number_id:{type:String,required:true},
        whatsAppBusinessId:{type:String,required:true},
        appId:{type:String,required:true},
        webhook_url:{type:String,required:false},
        token:{type:String,required:true},
        tokenExpireTimeStamp:{type:String,required:true},
        verifyToken:{type:String,required:false},
        version:{type:String,required:true},
    },required:false},

    isPaid:{type:Boolean,required:false,default:false},
    PaymentConfig:{type:{
        priceId:{type:String,required:true},
        customerId:{type:String,required:true},
    }},

    Admin:{type:Boolean,required:false,default:false},
   
 
},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        next();
    }

    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword =async function(enteredPassword:string){
    return await bcrypt.compare(enteredPassword,this.password);
}

type User = InferSchemaType<typeof userSchema> & {
    matchPassword(enteredPassword: string): Promise<boolean>;
  };

export default model<User>("User",userSchema);