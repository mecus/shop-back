import { Error } from "mongoose";

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dxxw6jfih',
    api_key: '713573881711642',
    api_secret: 'hfll2wcsfo2SXltiO2LiRxZ5Y0k'
});

export const RemoveImage = (image) => {
    try {
        return cloudinary.v2.uploader.destroy(image, {invalidate: true }, (error, result) => {
            console.log(result);
            if (error) {
                throw new Error("CloudError");
            }
            return result;
        });
    }
    catch (err) {
        throw new Error("CloudDoom");
    }
};
