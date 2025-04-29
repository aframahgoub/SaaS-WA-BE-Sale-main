import { InferSchemaType, model, Schema } from "mongoose";

const productSchema=new Schema({
    userId:{ type: Schema.Types.ObjectId, ref: 'User'},
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceId: { type: String, required: true },
    productId: { type: String, required: true },
    currency: { type: String, required: true },
    interval: { type: String, required: true },
    amount: { type: String, required: true },
    features: [{ type: String, required: true }],
    show:{type: Boolean,default:true}

},{timestamps:true});

export type ProductType=InferSchemaType<typeof productSchema>;

export default model<ProductType>("Product",productSchema);