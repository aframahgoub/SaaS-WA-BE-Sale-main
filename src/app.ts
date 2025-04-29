import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/notes";
import userRoutes from "./routes/user";
import webhookRoutes from "./routes/webhook";
import flowRoutes from "./routes/flow"
import mediaRoutes from "./routes/media"
import stripeRoutes from "./routes/stripe"
import body_parser from "body-parser";
import cors from "cors"
import cookie from "cookie-parser";
const app = express();

app.use(
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    if (req.originalUrl === '/stripe/webhook') {  
      next();
    } else {
      express.json()(req, res, next);
      
    }
  }
);

app.use(express.urlencoded({extended: true}));


//to handle any frontend calls 
app.use(cookie());
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
      credentials: true,
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
  
  })
);


app.use("/webhook",webhookRoutes);
// app.use("/flow",flowRoutes);
app.use("/media",mediaRoutes);
app.use("/stripe",stripeRoutes);
app.use("/api/Messages",notesRoutes);
app.use("/api/users",userRoutes);

app.use("/",(req,res)=>{
  res.status(200).json(`server running on ${process.env.PORT}`)
});

app.use((req,res,next)=>{
  next(Error("End point not found"));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error:unknown,req:Request,res:Response,next:NextFunction)=>{
  console.error("# error start #");
  console.error(error);
  console.error("# error end #");
  let errorMessage="An unknown error occured";
  if(error instanceof Error){
    errorMessage=error.message;
    res.status(500).json({error:errorMessage});
  }
});

export default app;