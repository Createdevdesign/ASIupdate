import { AwsUploadAssets } from "../interfaces";
import debug from 'debug';
import path from 'path';

var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,region: 'us-east-2'});
const bucketName = process.env.assests_s3_bucket_name;
const log: debug.IDebugger = debug('app:awsemail-service');


const bucketPromise = new AWS.S3({
  apiVersion: '2010-12-01'
});
class AwsS3Service implements AwsUploadAssets {

  public async uploadStoreAssetInS3Bucket(imageData: any, store_id: string, type: string ) {
    
    
    const s3Params = {
      Bucket: bucketName,
      Key: store_id+"_"+type+"_"+path.parse(imageData.image.name).name+path.parse(imageData.image.name).ext, // file name you want to save as
      ContentType: imageData.image.mimetype,
      // ContentEncoding: imageData.encoding,
      Body: imageData.image.data,
      ACL: 'public-read',
    };

    let s3;
    try {
      s3 = await bucketPromise.upload(s3Params).promise();
    }
    catch (err) {
        return err;
    }
    return s3;
  }

  public async deleteStoreAssetInS3Bucket(pictureUrl:any){
    log(
      "Delete Store image in s3 bucket."
    );
    
    const s3Params = {
      Bucket: bucketName,
      Key: pictureUrl
    };
    let s3;
    try {
      await bucketPromise.deleteObject(s3Params).promise();
      s3 = true;
    }
    catch (err) {
        s3 = false;
        return err;
    }
    return s3;
  }

}

export default new AwsS3Service();
