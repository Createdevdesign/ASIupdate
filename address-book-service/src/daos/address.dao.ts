import mongooseService from '@swiftserve/node-common/dist/services/mongoose.service';
import shortid from 'shortid';
import debug from 'debug';
import moment from 'moment';
import { CreateAddressDto } from '../dto/create.address.dto';
import { PatchAddressDto } from '../dto/patch.address.dto';
import { PutAddressDto } from '../dto/put.address.dto';

const log: debug.IDebugger = debug('app:address-dao');

class AddressDao {
    Schema = mongooseService.getMongoose().Schema;
    Types = mongooseService.getMongoose().Types;
    
    AddressSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
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
        createdDate: { type: Date, default: moment().utc() },
      });
      
    CustomerSchema = new this.Schema({
        _id: { type: String },
        FirstName: {
          type: String,
        },
        LastName: {
          type: String,
        },
        Username: {
          type: String,
        },
        Password: {
          type: String,
        },
        Email: {
          type: String,
        },
        Active: {
          type: Boolean,
        },
        Addresses: {
          type: [this.AddressSchema],
        },
      });
      StateProvinceSchema = new this.Schema({
        _id: { type: String, default: this.Types.ObjectId },
        
      });
    Customer = mongooseService.getMongoose().model('Customer', this.CustomerSchema, 'Customer');
    StateProvince = mongooseService.getMongoose().model('StateProvince', this.StateProvinceSchema, 'StateProvince');
    constructor() {
        log('Created new instance of AddressDao');
        mongooseService.getMongoose().set('debug', true);
    }

   

    

    async getAddressesByCustomerId(customerId: string) {
        const customer = await this.Customer
      .findById({ _id: customerId }, { Addresses: 1 })
      .exec();
      console.log(customer);
        return customer;
      
      
        // return this.Store.findOne({ _id: storeId }).populate('Store').exec();
    }

    async findStateByAddressStateProvinceId(stateProvinceId: any) {
      const state = this.StateProvince
      .findById({ _id: stateProvinceId })
      .exec();
    return state;
    }

    async getAddressByCustomerIdAndAddressID(
        customerId: string,
        addressId: string
      ) {
        // logger.debug("Fetching address by customer Id and address id.");
        const customer = await this.Customer
          .findOne(
            { _id: customerId, "Addresses._id": addressId },
            { "Addresses.$": 1 }
          )
          .exec();
            return customer;
       
      }
      async deleteAddressByCustomerIdAndAddressID(
        customerId: string,
        addressId: string
      ) {
        // logger.debug("Fetching address by customer Id and address id.");
            const customer = await this.Customer
            .findOneAndUpdate({ _id: customerId }, { $pull: { Addresses: { _id: addressId } } }, { new: true })
            .exec();
            return customer?1:0;
       
      }
      async addAddress(addressFields: any, customerId: string) {
        if(addressFields.Default === true){
          await this.updateAddress(customerId);
        }
        const address = await this.Customer
        .findOneAndUpdate({ _id: customerId }, { $push: { Addresses: addressFields } })
        .exec();
        return address;
    }


    
    
    async updateAddressByCustomerIdAndAddressId(
      customerId: string,
      addressId: string,
      address: any
    ) {
      if(address.Default === true){
        await this.updateAddress(customerId);
      }
      const addressFinalData = {
        "Addresses.$.StateProvinceId": address.StateProvinceId,
        "Addresses.$.Address1": address.Address1,
        "Addresses.$.FirstName": address.FirstName,
        "Addresses.$.LastName": address.LastName,
        "Addresses.$.CountryId": address.CountryId,
        "Addresses.$.ZipPostalCode": address.ZipPostalCode,
        "Addresses.$.PhoneNumber": address.PhoneNumber,
        "Addresses.$.Default": address.Default,
        "Addresses.$.City": address.City,
        "Addresses.$.Company": address.Company,
        "Addresses.$.Email": address.Email,
        "Addresses.$.Address2": address.Address2,
        "Addresses.$.State": address.State,
        "Addresses.$.Verified": address.Verified,
        "Addresses.$.Coordinates": address.Coordinates,
      }
      // logger.debug("Updating address data", addressFinalData);
      const updatedAddress = await this.Customer
        .updateOne(
          { _id: customerId, "Addresses": { $elemMatch: { "_id": addressId}} },
          { "$set": addressFinalData}
        )
        .exec();
      return updatedAddress;
     
    }

    public async updateAddress(
      customerId: string
    ): Promise<Boolean> {
      log("Change Default value  address by customer Id.");
      console.log("customerId " + customerId)
      await this.Customer
        .findOneAndUpdate({ _id: customerId }, 
          // { $set: { "Addresses.$[].Default": false } },
          { $set: { "Addresses.$[elem].Default": false } },
          {
            arrayFilters: [{ "elem.Default": true }]
          }
          )
        .exec();
      return true;
    }
}

export default new AddressDao();
