import {getLocation, Location, SCREEN_RESPONSES} from "../util/flowData";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getNextScreen = async (decryptedBody: {
  screen: any;
  data?: any;
  version: any;
  action: any;
  flow_token: any;
}) => {
  const { screen, data, version, action, flow_token } = decryptedBody;

  console.log("flow token ", flow_token);

  // handle health check request
  if (action === "ping") {
    return {
      version,
      data: {
        status: "active",
      },
    };
  }

  // handle error notification 
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      version,
      data: {
        acknowledged: true,
      },
    };
  }


   
    if(flow_token==="Prasath"){
         // handle initial request when opening the flow and display APPOINTMENT screen
        // handle initial request when opening the flow and display APPOINTMENT screen
        if (action === "INIT") {
          console.log("INIT for Prasath");
          
          return {
            ...SCREEN_RESPONSES.APPOINTMENT,
            data: {
              ...SCREEN_RESPONSES.APPOINTMENT.data,
              // these fields are disabled initially. Each field is enabled when previous fields are selected
              is_location_enabled: false
            },
          };
        }

        
        if (action === "data_exchange") {
          console.log("data exchange triggered");
          

          // handle the request based on the current screen
          switch (screen) {
            // handles when user interacts with APPOINTMENT screen
            case "APPOINTMENT":
              console.log("data exchange triggered for APPOINTMENT");
              // update the appointment fields based on current user selection

              // eslint-disable-next-line no-case-declarations
              let respectiveLocation: Location[]=[];
              console.log(data?.department);
              if(data?.department){
                respectiveLocation=getLocation(data.department);
                console.log("user's selected department is ",data.department);
              }

              return {
                ...SCREEN_RESPONSES.APPOINTMENT,
                data: {
                  // copy initial screen data then override specific fields
                  ...SCREEN_RESPONSES.APPOINTMENT.data,
                  // each field is enabled only when previous fields are selected
                  is_location_enabled: Boolean(data.department),    
                  //TODO: filter each field options based on current selection, here we filter randomly instead
                  location: respectiveLocation,
                },
              };


            case "if you have other scrren, add the id here":
              console.log("your scrren here");
            break;
            
            default:
              break;
          }
        }
    }
  
  

  console.error("Unhandled request body flow :", decryptedBody);
  // throw new Error(
  //   "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  // );
};
