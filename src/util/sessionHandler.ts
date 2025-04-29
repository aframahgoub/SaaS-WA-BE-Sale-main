import mongoose from "mongoose";
import { Payload } from "./sessions";
import { deleteCurrentSession } from "./dbHandler";


export function sendRespectiveMessage(existingSessionId:mongoose.Types.ObjectId,to:string,payload: Payload): boolean {
    switch (payload) {

        case Payload.TIME_OUT:
           console.log("time out");
           deleteCurrentSession(existingSessionId);
        break;


      
    }

    return true;
}