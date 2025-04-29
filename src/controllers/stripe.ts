import { RequestHandler } from "express";
import stripePackage from "stripe";
import env from "../util/validateEnv";
import { debug, StripeProductMode } from "../util/sessions";
import { CustomRequest } from "../middleware/checkAuth";
import userModel from "../models/user";
import ProductModel from "../models/product";


const stripe_key = env.STRIPE_SECRET_KEY;
const base_url = env.FRONTEND_URL;
const stripe_end_point_secret =env.STRIPE_END_POINT_SECRET;


const stripe = new stripePackage(stripe_key,{
    apiVersion: '2024-04-10',
  });




export const addProduct: RequestHandler = async (req, res) => {
  try {

    const { priceId, features, title, description } = req.body;

    console.log(req.body);

    const userId = (req as CustomRequest).user._id;

    const userDetails = await userModel.findOne({ _id: userId });
    // const isExist = await ProductModel.findOne({ priceId: priceId });

    // if(isExist){
    //   return res.status(400).json({ message: "Already a product exist in this priceId" });
    // }

    if (userDetails && userDetails.Admin && priceId) {

      const price = await stripe.prices.retrieve(`${priceId}`);

      const feat = features.split(",").map((f: string) => f.trim()).filter((fe: string) => fe);
      console.log(feat);


      if (price) {

        const { product, currency, recurring, unit_amount } = price;



        if (product &&
          currency &&
          recurring &&
          unit_amount) {

          const created = await ProductModel.create({
            userId: userId,
            title,
            description,
            priceId,
            productId: product,
            currency,
            interval: recurring.interval,
            amount: (unit_amount / 100),
            features: feat
          })



          if (created) {
            console.log("added product:", created);

            return res.status(200).json(created);
          } else {
            return res.status(400).json({ message: "product creation failed" });

          }

        } else if (!recurring) {
          console.log("not a subcription product");
          return res.status(400).json({ message: "add a subscription product" });
        }


      }else{
        return res.status(400).json({ message: "price not found" });
      }


    } else {
      res.status(400).json({ message: "userDetails not found" });
    }
  } catch (error) {
    console.log("add product error", error);
    res.status(500).json(error);
  }
};


export const getProducts: RequestHandler = async (req, res) => {
  try {
    
   // const userId = (req as CustomRequest).user._id;

    const Products = await ProductModel.find();

    if (Products) {
      console.log("get products",Products);
      
      
      return res.status(200).json(Products);
       
    } else {
      res.status(400).json({ message: "Products not found" });
    }
  } catch (error) {
    console.log("get product error",error);
    res.status(500).json(error);
  }
};


export const makeSubscription: RequestHandler = async (req, res) => {
    try {
        
        const { priceId } = req.params;
        const { userName,email ,PaymentConfig} = (req as CustomRequest).user;
        console.log("priceId:",priceId);
        
        if (!userName || !email) {
          return res.status(400).json({ message: "userName notfound" });
        }
    
        if(priceId){
          let customer: stripePackage.Customer|null=null;
          

          if(PaymentConfig&&PaymentConfig.customerId){
            const customerResponse = await stripe.customers.retrieve(PaymentConfig.customerId);
            if (customerResponse) {
              if (isDeletedCustomer(customerResponse)) {
                console.log('Customer is deleted');
                res.status(400).json({ message: "Customer is deleted" });
                return;
              }
          
              // Narrowing the type to Customer
              if ('email' in customerResponse && 'id' in customerResponse) {
                customer = customerResponse as stripePackage.Customer;
                customer = await stripe.customers.update(
                  customer.id,
                  {
                    metadata: {
                      priceId:priceId
                    },
                  }
                );
                console.log("existing customer");
                
              }else{
                customer=null
              }
            }

          }else{

            customer = await stripe.customers.create({
              name: userName,
              email:email,
              metadata: {
                priceId:priceId
              },
            });
            console.log("new customer");
          }

          if(customer){

            const stripeSession = await stripe.checkout.sessions.create({
                success_url: `${base_url}/plans`,
                cancel_url: `${base_url}`,
                payment_method_types: ["card"],
                mode:StripeProductMode.SUBSCRIPTION,
                line_items: [
                    {
                        price:priceId,
                        quantity: 1,
                    },
                ],
                customer: customer.id,
            });
  
            if(stripeSession){

              console.log("stripeSession:",stripeSession);
              
             return res.status(200).json(stripeSession);
            }else{
              return res.status(400).json({ message: "failed to create stripe session" });
            }
          }else{
            return res.status(400).json({ message: "failed to create customer" });
          }
  
  
        }else{
          return res.status(404).json({ message: "priceId not found" });
        }
    } catch (error) {
        console.error(error);
       return res.status(500).send(error);
    }
}


export const checkStripeWebhook: RequestHandler = async (req, res)=> {
    const sig = req.headers['stripe-signature'] as string;
    console.log("Listening to stripe webhook");
    if (!sig) return res.status(400).end();
   
    let event;

    try {
       
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            stripe_end_point_secret
        );

        
        
        console.log(event.type);
          switch (event.type) {
            case 'checkout.session.completed':{

              console.log(JSON.stringify(event,null,2));
              console.log("-----",event.data.object.customer);

             const customer=await stripe.customers.retrieve(`${event.data.object.customer}`);
             console.log("customer:",customer);
             console.log("priceid:",(customer as any).metadata.priceId);

             const userDetails=await userModel.findOne({email:(customer as any).email})

            //  console.log(userDetails);

             if(userDetails){
              userDetails.isPaid=true
              userDetails.PaymentConfig={
                customerId:event.data.object.customer as string,
                priceId:(customer as any).metadata.priceId
              }

              const updated=await userDetails.save();
              if(updated){
                console.log("updated:",updated);
                
              }
             }
             
             

              }
                break;
            case 'checkout.session.expired':{
              //todo
            }break;
            case 'invoice.paid':{
              //todo
            }break;
            case 'invoice.payment_failed':{
              //todo
            }break;
            default:
                console.log(event.type);
                break;
        }
        
        res.sendStatus(200).end();
    } catch (err) {
        console.error(err);
        return res.status(400).send('Webhook Error');
    }
};
     

export function isDeletedCustomer(customer: stripePackage.Customer | stripePackage.DeletedCustomer): customer is stripePackage.DeletedCustomer {
  return (customer as stripePackage.DeletedCustomer).deleted !== undefined;
}