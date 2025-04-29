export const FLOW_CATEGORY_NAME="name";
export const FLOW_CATEGORY_TOKEN="token";
export const FLOW_CATEGORY_ID="123";

export const SCREEN_RESPONSES = {
  APPOINTMENT: {
    version: "3.0",
    screen: "APPOINTMENT",
    data: {
      department: [
        {
          id: "1",
          title: "Department-1",
        },
        {
          id: "2",
          title: "Department-2",
        }
      ],
      location: [],
      is_location_enabled: false,
    },
  }
};

export interface Location{
  id:string,
  title:string
}

export function getLocation(departmentID: string):Location[]{
  switch (departmentID) {
      case "1":
          return [
                  {
                    id: "11",
                    title: "Department-1's Location 1",
                  },
                  {
                    id: "12",
                    title: "Department-1's Location 2",
                  }
                ];
      case "2":
          return [
                  {
                    id: "21",
                    title: "Department-2's Location 1",
                  },
                  {
                    id: "22",
                    title: "Department-2's Location 2",
                  }
                 ];
      default:
          // Handle the case when data doesn't match any of the cases above
          return [];
  }
}