import discountlogDao from '../daos/discountlog.dao';

class DiscountService {
    async getStorePromotionList(queryData: any, storeId: string){
        const stores: any = await discountlogDao.findDiscountUsingStoreId(
          queryData,
          storeId,
        );
        return stores;
      }
}

export default new DiscountService();
