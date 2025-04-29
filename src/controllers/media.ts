import { Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { cloudinaryUploadImg, deleteMediaUsingId, downloadMediaFromURL, getMediaURLFromMediaID, uploadMediaFile } from "../util/apiHandler";
import { io } from '../server';


const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

const filefilter = (req: any, file: any, cb: (arg0: null, arg1: boolean) => void) => {
  if (!file) {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fieldSize: 100 * 1024 * 1024 },
  fileFilter: filefilter,
});

export const check = async (req: Request, res: Response) => {
  
  try {
      console.log("check uploads triggerred");
      res.status(200).json({ message: '/media End point working fine!' });
    } catch (error) {
      res.status(500).json({ error: '/media End point is not working!' });
    }
  };

export const uploadFile = async (req: Request, res: Response) => {

  console.log(req.body);
  
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const uploadResponse = await cloudinaryUploadImg(file);//uploadFileToExternalApi(file.path);
    // Clean up the uploaded file from the server
   // fs.unlinkSync(file.path);
  
    res.status(200).send(uploadResponse);
  } catch (error) {
    res.status(500).json({ error: 'unable to upload' });
  }

};

//mediaDownload
// export const mediaDownload:RequestHandler=async (req,res) => {

//   const mediaId=req.params.mediaID;

//     try {
//       const mediaUrlResponse= await getMediaURLFromMediaID(mediaId);

//         if ('error' in mediaUrlResponse) {
//           // If the response contains an error, send the error message
//           res.status(404).json({ error: mediaUrlResponse.error });
//         } else {
//           // If the response is successful, send the media URL and other details
//           const media=mediaUrlResponse;

//           //get mediaBuffer from url 
//           const mediaBuffer=await downloadMediaFromURL(media.url);

//           res.contentType(media.mime_type);
//           res.status(200).send(Buffer.from(mediaBuffer, 'binary'))
//         }
      
//     } catch (error) {
//         // If an error occurs, log it and return a server error
//         console.error('Error getting mediaDownload:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// //mediaDelete
// export const mediaDelete:RequestHandler=async (req,res) => {

//   const mediaId=req.params.mediaID;

//       try {
//         const response = await deleteMediaUsingId(mediaId);

//         if ('error' in response) {
//             res.status(400).json(response);  // Send the error response with appropriate status code
//         } else {
//             res.status(200).json(response);  // Send the success response
//         }
        
//       } catch (error) {
//         // If an unexpected error occurs, log it and return a server error
//         console.error('Error processing mediaDelete:', error);
//         res.status(500).json({ error: 'Internal server error' });
//       }
// };