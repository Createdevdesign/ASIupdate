import storeregistrationDao from '../daos/storeregistration.dao';
import storesDao from '../daos/stores.dao';
const moment = require('moment-timezone');

class StoreRegistrationService {
  async activeStoreAccount(key: any, res:any) {
    const getStore: any = await storeregistrationDao.findStoreRegistrationByGenericAttributesKey(key);
    if (!getStore) {
      return res.status(401).send({errors:['"Store Not Exist"']});
    }
    let createdStoreDate:any = getStore["CreatedDateOnUtc"];
    let todayDate: any = new Date();
    let dateTime = Math.floor((todayDate - createdStoreDate) / (1000 * 60));
    
    if(dateTime > 10){
      return res.status(400).send({errors:["Your key is expired"]});;
    }
    
    if (getStore?.Configuration?.Active === true) {
      return res.status(400).send({errors:["Already store is registered"]});
    }
    
    const storesRegistration: any = await storeregistrationDao.activateStoreRegistrationByKey(key);
    if (!storesRegistration) {
      return res.status(400).send({errors:["No stores found"]});
    }
      // logger.debug("No stores found");
    let configurations = {
      "IsDelivery": storesRegistration?.Configuration?.IsDelivery,
      "IsPickUp": storesRegistration?.Configuration?.IsPickUp,
      "SupportsDelivery": storesRegistration?.Configuration?.SupportsDelivery,
      "Active": true,
      "DeliveryFeesByPostalCode": storesRegistration?.Configuration?.DeliveryFeesByPostalCode,
      "DeliveryFeesByRadius": storesRegistration?.Configuration?.DeliveryFeesByRadius
    }
    let storeSession:any = {
      Tags: storesRegistration?.Tags,
      Name: storesRegistration?.Name,
      GenericAttributes: storesRegistration?.GenericAttributes,
      CompanyName: storesRegistration?.CompanyName,
      Url: storesRegistration?.Url,
      CompanyEmail: storesRegistration?.CompanyEmail,
      CompanyPhoneNumber: storesRegistration?.CompanyPhoneNumber,
      PayAtStore: storesRegistration?.PayAtStore,
      CompanyVat: storesRegistration?.CompanyVat,
      SslEnabled: storesRegistration?.SslEnabled,
      DefaultLanguageId: storesRegistration?.DefaultLanguageId,
      DefaultWarehouseId: storesRegistration?.DefaultWarehouseId,
      CompanyHours: storesRegistration?.CompanyHours,
      Configuration: configurations,
      CreatedDateOnUtc: moment().utc().format(),
      Address:storesRegistration.Address
    }
    const stores: any = await storesDao.createStoreUsingCustomerId(storeSession);
    if (!stores) {
      return res.status(404).send({errors:["No stores found"]});
    }else{
      return "Completed your store register";
    }
  }
}

export default new StoreRegistrationService();
