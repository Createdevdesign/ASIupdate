import moment from 'moment';
import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
// import { Types } from 'mongoose';


let Types = mongooseService.getMongoose().Types;
export interface PutAddressDto {
    // _id: { type: String, default: Types.ObjectId },
    FirstName: { type: String },
    LastName: { type: String },
    Email: { type: String },
    Company: { type: String },
    CountryId: { type: String },
    StateProvinceId: { type: String },
    City: { type: String },
    Address1: { type: String },
    Address2: { type: String },
    ZipPostalCode: { type: String },
    PhoneNumber: { type: String },
    FaxNumber: { type: String },
    Verified: { type: Boolean },
    Coordinates: { lat: String, lon: String },
    Default: { type: Boolean, default: false},
    // createdDate: { type: Date, default: moment().utc() },
}
