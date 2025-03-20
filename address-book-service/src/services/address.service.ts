// import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
// import unirest from "unirest";
import parser from "fast-xml-parser";
import { CreateAddressDto } from '../dto/create.address.dto';
import { PutAddressDto } from '../dto/put.address.dto';
import { PatchAddressDto } from '../dto/patch.address.dto';
import AddressDao from '../daos/address.dao';
var unirest = require('unirest');
// var parser = require('fast-xml-parser');
class AddressService implements CRUD {
    async create(resource: CreateAddressDto) {
        return "hi";
    }

    async createAddress(resource: CreateAddressDto, customerId: string) {
        // logger.debug("Get Customer Address,");
        let addressData:any = await this.getCorrectedAddress(
            resource
        );
        if(addressData === "State is empty")
        {
          return {status:400, message:{errors:["StateProvinceId is a required field"]}}
        }
        if(addressData === "No State in DB")
        {
          return {status:400, message:{errors:["Provide correct state province Id"]}}
        }
        if(addressData) {
          const createAddress = await AddressDao.addAddress(addressData, customerId);;
          if (!createAddress) {
            return {status:404, message:{errors:['create address error']}};
          }else{
            return {status:201, message:true};
          }
        }
        else {
          return {status:404, message:{errors:['create addressData error']}};
        }
        
    }

    async getCorrectedAddress(address: any) {
        
        if(address.StateProvinceId === "" || address.StateProvinceId === null || address.StateProvinceId === undefined){
          // return {status:400, message:{errors:["StateProvinceId is a required field"]}}
         return "State is empty" 
        }
        const state: any = await AddressDao.findStateByAddressStateProvinceId(address.StateProvinceId);
        if(!state){
          return "No State in DB" 
          
        }
        address["State"] = state.Abbreviation;
        address["Verified"] = false
        let tomTomData = await this.fetchCordinatesForAddress(address);
        let uspsData = await this.fetchCorrectedAddress(
          address,
          state,
          tomTomData
        );
        return uspsData;
      }

      async fetchCorrectedAddress(
        address: any,
        state: any,
        tomTomGetData: any
      ){
        // logger.debug("Fetching Usps api for postalcode.");
    
        const splitZipPostalCodeData = address.ZipPostalCode.split("-");
        let uspsXmlData = await unirest(
          "POST",
          `${
            process.env.usps_address_verification_api
          }?API=Verify&XML=<AddressValidateRequest USERID="${
            process.env.usps_userid
          }"><Revision>1</Revision><Address ID="0"><Address1>${
            tomTomGetData.Address1
          }</Address1><Address2>${tomTomGetData.Address2}</Address2><City>${
            tomTomGetData.City
          }</City><State>${state.Name}</State><Zip5>${
            splitZipPostalCodeData[0]
          }</Zip5><Zip4>${
            splitZipPostalCodeData.length === 1 ? "" : splitZipPostalCodeData[1]
          }</Zip4></Address></AddressValidateRequest>`
        );
        // logger.debug("Usps Data response", uspsXmlData);
        const uspsConvertXmlToJson:any = uspsXmlData.error
          ? uspsXmlData.error
          : parser.parse(
              uspsXmlData.raw_body,
              {
                attributeNamePrefix: "",
                arrayMode: false,
                ignoreAttributes: false,
                parseAttributeValue: true,
              },
              true
            );
        const addressVerifiedData =
          uspsConvertXmlToJson.Error || uspsConvertXmlToJson.errno
            ? tomTomGetData
            : uspsConvertXmlToJson.AddressValidateResponse.Address.Error
            ? tomTomGetData
            : this.getUspsArray(
                uspsConvertXmlToJson.AddressValidateResponse.Address,
                tomTomGetData
              );
        return addressVerifiedData;
      }

      public async fetchCordinatesForAddress(addressData: any) {
        let tomtomResponse = await unirest(
          "GET",
          `${
            process.env.tom_tom_api +
            addressData.Address1.replace(/[#%]/g, '') +
            " " +
            addressData.Address2.replace(/[#%]/g, '') +
            " " +
            addressData.City.replace(/[#%]/g, '') +
            " " +
            addressData?.state +
            " " +
            addressData.ZipPostalCode
          }.json?key=${process.env.tom_tom_secret_key}`
        );
        
        let tomtomConvertStingToJsonData = JSON.parse(tomtomResponse?.raw_body);
        if(tomtomConvertStingToJsonData.httpStatusCode === 404 || tomtomConvertStingToJsonData.results.length === 0)
          return {status:400, message:{errors:['Please verify your address.']}};
          
        addressData.Coordinates =tomtomConvertStingToJsonData.results[0].position?tomtomConvertStingToJsonData.results[0].position:
          tomtomConvertStingToJsonData.results[0].entryPoints[0].position;
        return addressData;
      }
      // async findStateByAddressStateProvinceId(
      //   stateProvinceId: any
      // ) {
      //   // logger.debug("Fetching addresses by state province Id.");
      //   const state: any = await AddressDao.findStateByAddressStateProvinceId(stateProvinceId);
         
      // }
      private getUspsArray(uspsConvertXmlToJson: any, addressData: any) {
        if (!uspsConvertXmlToJson) return null;
    
        const uspsGenerateData = {
          StateProvinceId: addressData.StateProvinceId,
          Address1: uspsConvertXmlToJson.Address1,
          LastName: addressData.LastName,
          CountryId: addressData.CountryId,
          ZipPostalCode:
            uspsConvertXmlToJson.Zip4 === ""
              ? uspsConvertXmlToJson.Zip5
              : uspsConvertXmlToJson.Zip5 + " - " + uspsConvertXmlToJson.Zip4,
          PhoneNumber: addressData.PhoneNumber,
          Default: addressData.Default,
          City: uspsConvertXmlToJson.City,
          Company: addressData.Company,
          Email: addressData.Email,
          FirstName: addressData.FirstName,
          Address2: uspsConvertXmlToJson.Address2,
          Verified: true,
          Coordinates: addressData.Coordinates,
        };
        return uspsGenerateData;
      }

    async updateAddress(resource: PatchAddressDto, customerId: string, addressId: string) {
      const address = await this.getAddress(customerId, addressId);
      if(address) {
      let addressData = await this.getCorrectedAddress(
          resource
      );

      if(addressData === "State is empty")
      {
        return {status:400, message:{errors:["StateProvinceId is a required field"]}}
      }
      if(addressData === "No State in DB")
      {
        return {status:400, message:{errors:["Provide correct state province Id"]}}
      } 
      
        if(addressData) {
          const updateAddress = await AddressDao.updateAddressByCustomerIdAndAddressId( customerId, addressId, resource);
          if (!updateAddress) {
            return {status:404, message:{errors:['update address error']}};
        }else{
            return {status:200, message:true};
        }
        }
        else {
          return {status:404, message:{errors:['create addressData error']}};
        }
      }
      else {
        return {status:404, message:{errors:['Address not found']}};
      }
     
    }

    async deleteById(id: string) {
        // return StoresDao.removeStoreById(id);
        return "id";
    }

    async list(limit: number, page: number) {
        // console.log("here");
        // return StoresDao.getStores(limit, page);
        return "";
    }

    async patchById(id: string, resource: PatchAddressDto): Promise<any> {
        // return AddressDao.updateAddressByCustomerIdAndAddressId(customerId, id, resource);
    }

    async putById(id: string, resource: PutAddressDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }

    async readById(id: string) {
        // return StoresDao.getStoreById(id);
    }

    async updateById(id: string, resource: CreateAddressDto): Promise<any> {
        // return StoresDao.updateStoreById(id, resource);
    }
    async getAddresses (customerId: string) {
        const Addresses = await AddressDao.getAddressesByCustomerId(customerId);
        if (Addresses) {
          return {status:200, message:{data:Addresses.Addresses}};
        } else {
          return {status:404, message:{errors:['Customer does not exists.']}};
        }
    }
    async getAddress (customerId: string, addressId: string) {
      const Customer = await AddressDao.getAddressesByCustomerId(customerId);
      if(Customer) {
        const Address = await AddressDao.getAddressByCustomerIdAndAddressID(customerId, addressId);
        if (Address) {
          return {status:200, message:{data: Address.Addresses}};
        } else {
          return {status:404, message:{errors:['Address does not exists.']}};
        }
      }
      else {
        return {status:404, message:{errors:['Customer does not exists.']}};
      }
        
    }
    async deleteAddress (customerId: string, addressId: string) {
        const deleteAddress = await AddressDao.deleteAddressByCustomerIdAndAddressID(customerId, addressId);
        if(deleteAddress) {
          return {status:200, message:true};
        }
        else {
          console.log("------------------------------------");
          return {status:404, message:{errors:['Delete Address error.']}};
        }
}
}

export default new AddressService();
