import { cleanEnv, port, str } from "envalid"; 

export default cleanEnv(process.env,{
    MONGO_CONNECTION_STRING:str(),
    PORT:port(),
    VERIFY_TOKEN:str(),
    VERSION:str(),
    STRIPE_SECRET_KEY:str(),
    STRIPE_END_POINT_SECRET:str(),
    CLOUD_NAME:str(),
    CLOUD_API_KEY:str(),
    CLOUD_API_SECRET:str(),
    FRONTEND_URL:str()

});