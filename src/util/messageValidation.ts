

export function messagesCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.messages && 
        body_param.entry[0].changes[0].value.messages[0]  
        ){
            return true;
        }else{
            return false;
        }
}

export function textMesssgeCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.messages && 
        body_param.entry[0].changes[0].value.messages[0] &&
        body_param.entry[0].changes[0].value.messages[0].text &&
        body_param.entry[0].changes[0].value.messages[0].text.body)
        {
            return true;
        }else{
            return false;
        }
}

export function statusCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.statuses && 
        body_param.entry[0].changes[0].value.statuses[0]){

            return true;

        }else{
            return false;
        }
}

export function imageMesssgeCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.messages && 
        body_param.entry[0].changes[0].value.messages[0] &&
        body_param.entry[0].changes[0].value.messages[0].type==='image' &&
        body_param.entry[0].changes[0].value.messages[0].image)
        {
            return true;
        }else{
            return false;
        }
}

export function videoMesssgeCheck(body_param: any): boolean {
  if (
    body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.messages &&
    body_param.entry[0].changes[0].value.messages[0] &&
    body_param.entry[0].changes[0].value.messages[0].type === "video" &&
    body_param.entry[0].changes[0].value.messages[0].video
  ) {
    return true;
  } else {
    return false;
  }
}

export function audioMesssgeCheck(body_param: any): boolean {
  if (
    body_param.entry &&
    body_param.entry[0].changes &&
    body_param.entry[0].changes[0].value.messages &&
    body_param.entry[0].changes[0].value.messages[0] &&
    body_param.entry[0].changes[0].value.messages[0].type === "audio" &&
    body_param.entry[0].changes[0].value.messages[0].audio
  ) {
    return true;
  } else {
    return false;
  }
}

export function documentMesssgeCheck(body_param:any):boolean{
  if(body_param.entry && 
      body_param.entry[0].changes && 
      body_param.entry[0].changes[0].value.messages && 
      body_param.entry[0].changes[0].value.messages[0] &&
      body_param.entry[0].changes[0].value.messages[0].type==='document' &&
      body_param.entry[0].changes[0].value.messages[0].document)
      {
          return true;
      }else{
          return false;
      }
}

export function payloadCheck(body_param:any):boolean{
  if(body_param.entry && 
      body_param.entry[0].changes && 
      body_param.entry[0].changes[0].value.messages && 
      body_param.entry[0].changes[0].value.messages[0] &&
      body_param.entry[0].changes[0].value.messages[0].button &&
      body_param.entry[0].changes[0].value.messages[0].button.payload){
          return true;
      }else{
          return false;
      }
}