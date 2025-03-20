import StoresDao from '../daos/stores.dao';
import { CRUD } from '@swiftserve/node-common';
import { CreateStoreDto } from '../dto/create.store.dto';
import { PutStoreDto } from '../dto/put.store.dto';
import { PatchStoreDto } from '../dto/patch.store.dto';
import moment from 'moment-timezone';
import customerlogDao from '../daos/customerlog.dao';
import awsService from './aws.service';
// const moment = require('moment-timezone');
import debug from 'debug';
var unirest = require('unirest');

const log: debug.IDebugger = debug('app:store-service');

class StoresService implements CRUD {
    async create(resource: CreateStoreDto) {
        return StoresDao.addStore(resource);
    }

    async deleteById(id: string) {
        return StoresDao.removeStoreById(id);
    }

    async list(limit: number, page: number) {
        return StoresDao.getStores(limit, page);
    }

    async patchById(id: string, resource: PatchStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async putById(id: string, resource: PutStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async readById(id: string) {
        return StoresDao.getStoreById(id);
    }

    async updateById(id: string, resource: CreateStoreDto): Promise<any> {
        return StoresDao.updateStoreById(id, resource);
    }

    async getStoreList(customerId:string,queryData:any,Latitude:any, Longitude:any, res:any) {
        const stores: any = await StoresDao.findStoresByCustomerId(customerId, queryData, Latitude, Longitude);
        if(!stores){
            return res.status(404).send({errors:['"No Authorized Stores found."']});
        }
        let storesData:any = stores;
          const storesList:any = [];
          storesData.data.forEach((element:any) => {
            if (element.CompanyHours) {
              const storeHours = JSON.parse(element.CompanyHours);
              var hours:any= this.calculateStoreHours(element,storeHours.timeZone === ""?"America/Chicago":storeHours.timeZone);
              delete element.CompanyHours
              storesList.push({...element, IsOpen:hours.open, IsHoliday:hours.holiday, StoreHours:hours.operationalHours})
            }else{
              delete element.CompanyHours
              storesList.push({...element, IsOpen:false, IsHoliday:false, StoreHours:null})
            }
          });
          let storeArray:any = {
            "total": stores.total,
            "data": storesList,
            "page": stores.page
          }
        return storeArray;
    }

    public calculateStoreHours(
        storeInfo: any,
        timeZone: string,
      ){
        var result:any = { open: false, holiday: false };
        if (storeInfo.CompanyHours) {
          
            const oHours = JSON.parse(storeInfo.CompanyHours);
                var currentTime = moment().tz(timeZone);
                var oDay = oHours.open.filter((d:any) => d.day == currentTime.day());
                if (oHours.closedDays.some((item:any) => item.date === currentTime.format("MM/DD/yyyy"))) {
                    result.holiday = true;
                    result.operationalHours = "Close Today";
                    result.startTime = moment().tz(oHours.timeZone).format("hh:mm");
                    result.endTime = moment().tz(oHours.timeZone).format("hh:mm");
                }  else if (oDay) {
                    var rHours:any = "";
                    var hourStartTime:any = "";
                    var hourEndTime:any = "";
                    oDay.forEach((o:any) => {
                        var startTime = moment().tz(oHours.timeZone).hours(o.startTime.split(':')[0]).minutes(o.startTime.split(':')[1]);
                        var endTime = moment().tz(oHours.timeZone).hours(o.endTime.split(':')[0]).minutes(o.endTime.split(':')[1]);
                        if (rHours != "") {
                            rHours = rHours + ", ";
                        }
                        rHours = rHours + startTime.format("hh:mmA") + " - " + endTime.format("hh:mmA");
                        hourStartTime = startTime.format("hh:mm");
                        // hourEndTime = endTime.format("hh:mm");
                        hourEndTime = endTime;
                        
                        if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
                            result.open = true;
                            return;
                        }
                    });
                    rHours = rHours + " " + moment().tz(oHours.timeZone).format("z");
                    result.operationalHours = rHours;
                    result.startTime = hourStartTime;
                    result.endTime = hourEndTime;
                }
        }
        return result;
      }

    async getStoreByStoreAndCustomerId(storeId: string, customerId:string) {
        return StoresDao.getStoreByStoreidAndCustomerId(storeId, customerId);
    }

    async getStoreHoursInfo(storeId: string,timezone:string,queryData: any, res:any) {
        const storeInfo: any = await StoresDao.getStoreByStoreId(storeId);
        if(!storeInfo){
            return res.status(404).send({errors:['No Stores found']});
        }
        var result:any = { open: false, holiday: false };
        
        if (storeInfo.CompanyHours) {
            var hours:any= this.calculateStoreHours(storeInfo, timezone);
            result.open = hours.open;
            result.holiday = hours.holiday;
            result.operationalHours = hours.operationalHours;
            if(queryData.type === "pickup"){
                var pickUpHours:any = this.pickUpScheduleHours(queryData.type, storeInfo, timezone, storeInfo.Configuration.IsPickUp, storeInfo.Configuration.PickupCalendarDays, storeInfo.Configuration.PickupTimeInterval, hours.endTime, res);
                // result.availablePickupSchedule = pickUpHours;
                result.availableSchedule = pickUpHours;
            }
            if(queryData.type === "delivery"){
              if(!queryData.addressId && !queryData.address){
                return res.status(400).send({errors:['Please pass address id or address in params.']});
              }
              if(queryData.addressId && queryData.address){
                return res.status(400).send({errors:['Please pass only one address id or address in params.']});
              }
            }
            if(queryData.type === "delivery" && !!queryData.addressId){
                await this.verifiedZipCodeAndDistance(storeId, queryData.addressId, storeInfo, res,"addressId");
                var deliveryHours:any = this.pickUpScheduleHours(queryData.type, storeInfo, timezone, storeInfo.Configuration.SupportsDelivery, storeInfo.Configuration.DeliveryCalendarDays, storeInfo.Configuration.DeliveryTimeInterval, hours.endTime, res);
                // result.availableDeliverySchedule = deliveryHours;
                result.availableSchedule = deliveryHours;
            }
            
            if(queryData.type === "delivery" && !!queryData.address){
              await this.verifiedZipCodeAndDistance(storeId, queryData.address, storeInfo, res, "customerAddress");
              var deliveryHours:any = this.pickUpScheduleHours(queryData.type, storeInfo, timezone, storeInfo.Configuration.SupportsDelivery, storeInfo.Configuration.DeliveryCalendarDays, storeInfo.Configuration.DeliveryTimeInterval, hours.endTime, res);
              // result.availableDeliverySchedule = deliveryHours;
              result.availableSchedule = deliveryHours;
          }
        }
        if (result ) {
            //TODO fetch authorized store details from Store collection using storeid in Authorized stores.    
            return result;
        } else {
            return res.status(404).send({errors:['No Authorized Stores found']});
        }
    }

    public pickUpScheduleHours(
        type:any,
        storeInfo: any,
        timeZone: string,
        configuration: boolean,
        calenderDays: number,
        timeInterval: number,
        hourEndTime: string,
        res:any
    ){
          let availablePickupDeliverySchedule:any = []
          if(configuration === true){
            const oHours:any = JSON.parse(storeInfo.CompanyHours);
            var currentTime:any = moment().tz(timeZone);
            // var operationHoursEndTime = moment().tz(oHours.timeZone).hours(hourEndTime.split(':')[0]).minutes(hourEndTime.split(':')[1]);
            // var operationHoursEndTime = moment().tz(oHours.timeZone).hours(2).minutes(20);
            let loop:any = 0;
            if(currentTime > hourEndTime){
              loop = 1
            }
            for (let index = loop; index < calenderDays; index++) {
              let date = moment().tz(timeZone).format();
              if(type === "pickup"){
                var oDay = oHours.open.filter((d:any) => d.day == moment(moment(date).add(index, 'days').tz(timeZone).format("YYYY-MM-DD")).day());
              }else{
                if(oHours.delivery === undefined || oHours.delivery.length === 0){
                    return res.status(404).send({errors:['store doesnt support delivery.']});
                }
                //   throw new DocumentNotFoundError(404, "store doesn't support delivery.");
                var oDay = oHours.delivery.filter((d:any) => d.day == moment(moment(date).add(index, 'days').tz(timeZone).format("YYYY-MM-DD")).day());
              }
              var rPickUpTimings:any = [];
              oDay.forEach((o:any) => {
                  var startTime = moment().tz(oHours.timeZone).hours(o.startTime.split(':')[0]).minutes(o.startTime.split(':')[1]);
                  var endTime = moment().tz(oHours.timeZone).hours(o.endTime.split(':')[0]).minutes(o.endTime.split(':')[1]);
                  let todayDateMatch =  moment(date).tz(timeZone).format("YYYY-MM-DD") === moment(date).add(index, 'days').tz(timeZone).format("YYYY-MM-DD");
                  
                  if(moment().tz(timeZone).day() === o.day && todayDateMatch){
                    if (currentTime.isAfter(startTime) && currentTime.isBefore(endTime)) {
                      rPickUpTimings = this.intervals(moment().tz(timeZone).add(timeInterval, 'minutes'), endTime, timeInterval)
                      return;
                    } else if(currentTime.add(timeInterval, 'minutes') >= endTime || currentTime.isBefore(startTime)){
                      rPickUpTimings = this.intervals(startTime.add(timeInterval, 'minutes'), endTime, timeInterval)
                      return;
                    }else {
                      rPickUpTimings = this.intervals(startTime.add(timeInterval, 'minutes'), endTime, timeInterval)
                      return;
                    }
                }else{
                    rPickUpTimings = this.intervals(startTime.add(timeInterval, 'minutes'), endTime, timeInterval)
                    return;
                }
              });
              availablePickupDeliverySchedule.push({date:moment(date).add(index, 'days').tz(timeZone).format("YYYY-MM-DD"), "currentTime":moment().tz(timeZone).format("hh:mmA"), timings:rPickUpTimings})
              // availablePickupSchedule.push({date:moment(date).day(index).tz(timeZone).format("YYYY-MM-DD"), time:rPickUpTime, "currentTime":currentTime.format("hh:mmA")})
            }
          }
          return availablePickupDeliverySchedule;
      }

      
  public intervals(startString:any, endString:any, timeInterval:any){
    var start = moment(startString, 'YYYY-MM-DD hh:mm a');
    var end = moment(endString, 'YYYY-MM-DD hh:mm a');
   
    var result = [];
    var current = moment(start);
    while (current <= end) {
        var duration = moment.duration(end.diff(current));
        if(duration.asMinutes()<timeInterval){
          if(duration.asMinutes() >0 ){
            timeInterval=duration.asMinutes();
          }
        }
        result.push(current.format('hh:mmA'))
        current.add(timeInterval, 'minutes');
    }
    return result;
  }

  public async verifiedZipCodeAndDistance(storeId:any, addressId:any, storeInfo:any, res:any, type:any){
    let addressData;
    if(type === "addressId"){
      addressData = await customerlogDao.findAddressByAddressId(addressId, storeInfo.Address);
      if(!addressData){
          return res.status(404).send({errors:["No Address found."]});
      }
    }
    if(type === "customerAddress"){
      const addressObject = Object.fromEntries(new URLSearchParams(addressId));
      addressData = await this.fetchCordinatesForAddress(addressObject, res)
      // return res.status(404).send({errors:addressData});
    }
    console.log(addressData)
    let verified = this.verifyZipPostalCode(storeInfo, addressData)
    if(!verified){
      verified = await this.verifyLocationDistance(storeId, storeInfo, addressData, res)
    }
    if(!verified){
        return res.status(400).send({errors:["Store does not delivery to this address."]});
    }
    return verified
    // return addressData;
  }

  public verifyZipPostalCode(storeInfo:any, addressData:any){
    let zipCode = addressData.ZipPostalCode.split('-')[0]
    let verified = false;
    storeInfo.Configuration.DeliveryFeesByPostalCode.forEach((item:any) => item.PostalCodes.filter((element:any) => {
      if(element === addressData.ZipPostalCode || parseInt(element) === parseInt(zipCode)){
        verified = true;
      }
    }));
    return verified;
  }

  public async verifyLocationDistance(storeId:any, storeInfo:any, addressData:any, res:any){
    let verified = false
    let storeToCustomerDistance = await StoresDao.findGeoNearDistance(storeId, addressData) 
      if(!storeToCustomerDistance){
        return res.status(404).send({errors:["No Distance found."]});
      }
      
      storeInfo.Configuration.DeliveryFeesByRadius.forEach((item:any) => {
          if(item.Radius){
            
            console.log(storeToCustomerDistance["Distance"]/1609.344)
            if(item.Radius.Min !== undefined && item.Radius.Max !== undefined){
              if ((storeToCustomerDistance["Distance"]/1609.344) >= item.Radius.Min && (storeToCustomerDistance["Distance"]/1609.344) <= item.Radius.Max) {
                verified = true;
              }
            }
          }
        }
      );
    return verified;
  }

  async getCustomerRecentStoreCartList(customerId:string, queryData:any, res:any):Promise<any>{
    let getCustomerCartList = await customerlogDao.findCustomerUsingCustomerId(customerId, queryData);
    if (!getCustomerCartList) {
      return res.status(404).send({errors:["No Stores found."]});
    }
    const storesList:any = [];
    getCustomerCartList.data.forEach((element:any) => {
      if(element.Store !== undefined){
        if (element.Store.CompanyHours) {
          const storeHours = JSON.parse(element.Store.CompanyHours);
          var hours:any= this.calculateStoreHours(element.Store,storeHours.timeZone === ""?"America/Chicago":storeHours.timeZone);
          delete element.Store.CompanyHours
          storesList.push({...element, IsOpen:hours.open, IsHoliday:hours.holiday, StoreHours:hours.operationalHours})
        }else{
          delete element.Store.CompanyHours
          storesList.push({...element, IsOpen:false, IsHoliday:false, StoreHours:null})
        }
      }else{
        storesList.push({...element}) 
      }
    });
    
// console.log(result)
    if (!getCustomerCartList) {
      return res.status(404).send({errors:["Get Customer cart list error"]});
    }else{
      return {
        total: getCustomerCartList.total,
        data:storesList, 
        page: getCustomerCartList.page
      };
    }
  }


  updateStoreAssets = async (storeId: string, type: string, image: any) => {
    log("Verifying image file for storeId - " + storeId);
    if(!image.image){
      return {status:403, message:{errors:['Please pass correct key.']}};
    }
    let imageAllowedMimeTypes = ['image/jpeg','image/jpg', 'image/png']
    let fileType = imageAllowedMimeTypes.includes(image.image.mimetype)
    if (!fileType) return {status:403, message:{errors:['Please upload only jpeg, jpg, png images.']}};

    log("Verifying paramters type.");
    let types = ['logo', 'thumbnail', 'image']
    let parameterType: Boolean = types.includes(type)
    if (!parameterType) return {status:403, message:{errors:["Upload type error."]}};

    
    log("Get stores assets Data ." + parameterType);
    let assetDataVerify = await StoresDao.findStoreByStoreId(storeId);
    
    let typeUpperCase = type.charAt(0).toUpperCase() + type.substring(1);
    let assetfetchData = [];
    if(assetDataVerify['Configuration'] !== undefined){
      if(assetDataVerify['Configuration']['Assets'] !== undefined){
          if (assetDataVerify['Configuration']['Assets'][typeUpperCase] !== undefined) {
            if(assetDataVerify['Configuration']['Assets'][typeUpperCase] !== ""){
              log(`Delete ${typeUpperCase} in S3 bucket.`);
              let Url = assetDataVerify['Configuration']['Assets'][typeUpperCase].split('/')
              let splitUrl = Url[Url.length - 1];
              assetfetchData.push(assetDataVerify['Configuration']['Assets'][typeUpperCase]);
              await awsService.deleteStoreAssetInS3Bucket(splitUrl);
            }
          }
      }
    }

    log(`Uploading ${typeUpperCase} in S3 bucket.`);
    let UploadedStoreImageInS3Bucket = await awsService.uploadStoreAssetInS3Bucket(image, storeId, type);
    if (UploadedStoreImageInS3Bucket['statusCode'] === 403)  return {status:403, message:{errors:["S3 Bucket Access Denied."]}};
    let insertAssetData = await StoresDao.updateAssetData(UploadedStoreImageInS3Bucket, storeId, typeUpperCase, assetfetchData);
    if (insertAssetData && UploadedStoreImageInS3Bucket) {
      log("Assets Stores Passed.");
      return {status:200, message:{assetUrl:UploadedStoreImageInS3Bucket["Location"]}};
    } else {
      return {status:404, message:{errors:[`${typeUpperCase} asset update error.`]}};
    }    
  }

  public async deleteStoreAssets(storeId: string, type: string, image: any): Promise<any> {
    log("Verifying paramters type.");
    let types = ['logo', 'thumbnail', 'image']
    let parameterType: Boolean = types.includes(type)
    if (!parameterType) return {status:403, message:{errors:["Upload type error."]}};

    log("Verifying image file.");
    let typeUpperCase = type.charAt(0).toUpperCase() + type.substring(1);
    if(image === null || image === "" || image === undefined) return {status:403, message:{errors:[`pass correct ${typeUpperCase}.`]}};

    log("Get Store Details.");
    const storeInfo: any = await StoresDao.findStoreInfoByStoreId(storeId);
    if(storeInfo[typeUpperCase] !== image) return {status:403, message:{errors:[`There is no image ${storeInfo[typeUpperCase]} or else pass correct ${typeUpperCase}.`]}};

    log(`Delete ${typeUpperCase} in S3 bucket.`);
    let s3DeleteData;
    let Url = image.split('/')
    let splitUrl = Url[Url.length - 1];
    s3DeleteData = await awsService.deleteStoreAssetInS3Bucket(splitUrl);
    if(!s3DeleteData) return {status:404, message:{errors:[`${typeUpperCase} S3 bucket error.`]}};

    log(`Delete ${typeUpperCase} in Database.`);
    let delelteAssetData = await StoresDao.deleteAssetData(storeId, typeUpperCase);
    if (s3DeleteData && delelteAssetData) {
      log("Delete Store Asset is successfully .");
      return {status:200, message:{data:delelteAssetData === true?"Store image delete succesfull":delelteAssetData}};
    } else {
      return {status:404, message:{errors:[`${typeUpperCase} asset delete error.`]}};
    }
  }
  public async fetchCordinatesForAddress(addressData: any, res:any) {
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
          addressData?.State +
          " " +
          addressData.ZipPostalCode
      }.json?key=${process.env.tom_tom_secret_key}`
    );
    let tomtomConvertStingToJsonData = JSON.parse(tomtomResponse?.raw_body);
    if(tomtomConvertStingToJsonData.httpStatusCode === 404 || tomtomConvertStingToJsonData.results.length === 0)
      return res.status(400).send({errors:['Please verify your address.']});
      
      addressData.Coordinates =tomtomConvertStingToJsonData.results[0].position?tomtomConvertStingToJsonData.results[0].position:
      tomtomConvertStingToJsonData.results[0].entryPoints[0].position;
    return addressData;
  }
  async getStateProvincess () {
    const getStateProvincess = await StoresDao.getStateProvincess();
    if (getStateProvincess) {
      return {status:200, message:{result: {stateProvinces:getStateProvincess}}};
    } else {
      return {status:404, message:{errors:['State Provincess does not exists.']}};
    }
  }
  async updateStoreHours (storeId: string, body: any) {
    const updateStoreHours = await StoresDao.updateStoreHours(storeId, body);
    if (updateStoreHours) {
      return {status:200, message:{data:updateStoreHours}};
    } else {
      return {status:404, message:{errors:['Store hours not updated.']}};
    }
  }

  async scanQrCode (customerId: string, extId: any, timezone: string) {
    const checkIfCustomerExist = await customerlogDao.checkIfCustomerExist(customerId);
    if (!checkIfCustomerExist) {
      return {status:404, message:{errors:['Customer does not exists.']}};
    } 
    const checkIfQrCodeExist = await customerlogDao.checkIfQrCodeExist(extId);
    if (!checkIfQrCodeExist.length) {
      return {status:404, message:{errors:['QR Code is invalid']}};
    } 
    const checkIfStoreExist = await StoresDao.getStoreByStoreId(checkIfQrCodeExist[0].StoreId);
    if (!checkIfStoreExist) {
      return {status:404, message:{errors:['Store doesnot exist']}};
    } 
    if (checkIfStoreExist.CompanyHours) {
      var hours:any= this.calculateStoreHours(checkIfStoreExist, timezone);
      let resultData = {
        StoreName: checkIfStoreExist.Name,
        StoreAddress: checkIfStoreExist.CompanyAddress,
        StorePhoneNumber: checkIfStoreExist.CompanyPhoneNumber,
        StoreTiming: checkIfStoreExist.CompanyHours,
        IsOpen: hours.open,
        PayAtStore: checkIfStoreExist.PayAtStore,
        IsDelivery: (checkIfQrCodeExist[0].Type.toUpperCase() === "TABLE") ? false : true,
        IsPickUp: (checkIfQrCodeExist[0].Type.toUpperCase() === "TABLE") ? false : true,
        };
        return {status:200, message:{data: resultData}};
    }
    return {status:200, message:{errors: ["Company hours doesnot exist"]}};
  }
}

export default new StoresService();
