import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:picture-dao');

class PictureDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;

    pictureSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        MimeType: {
          type: String,
        },
        SeoFilename: {
          type: String,
        },
        AltAttribute: {
          type: String,
        },
        TitleAttribute: {
          type: String,
        },
        IsNew: {
          type: Boolean,
        },
        PictureBinary:{
          type: Buffer
        }      
    });

    Picture = mongooseService.getMongoose().model('Picture', this.pictureSchema, 'Picture');

    constructor() {
        log('Created new instance of ProductDao');
        mongooseService.getMongoose().set('debug', true);
    }

    public async createProductImageDataPictureCollection(
      pictureData: any
    ) {
      log("Create image data in picture collection.");
      const state: any = await this.Picture.create(pictureData);
      return state;
    }

    public async updateProductImageDataPictureCollection(
      pictureData: any,
      pictureId: string
    ) {
      log("update image data in picture collection.");
      const state: any = await this.Picture.findOneAndUpdate({_id:pictureId},{$set:pictureData}).exec();
      return state;
    }
  
    public async deleteByPictureId(pictureId: string){
      log("Piture collection delete by pictureId." + pictureId);
      const customerSession: any= await this.Picture.deleteOne({ _id:pictureId }).exec();
      return customerSession?1:0;
    }
}

export default new PictureDao();
