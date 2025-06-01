import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    


 const cloudinaryUploadHandler =   async function(localFilePath) {
    try {
        
  
    if(!localFilePath) return null;
  
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           localFilePath, {
            resource_type:"auto"
           }
       )
       .catch((error) => {
           console.log(error);
       });
    console.log("file upload successfull", uploadResult.url)
  return uploadResult;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }

   
}


export default cloudinaryUploadHandler;