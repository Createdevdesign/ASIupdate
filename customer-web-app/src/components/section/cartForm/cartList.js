import React from 'react';
import '../../css/Inventory.css';
// import InventoryAccordian from '../Inventory/inventoryAccordian';
// import Crossbutton from '../../svg/cross_button.svg';
import userBrowserHistory from '../../History';

function CartListDetail({ context}) {
  const navigateToCartOrSignIn = () => {
      if(context.authenticate){
        userBrowserHistory.push('/cart',{storeId:localStorage.getItem("restaurentId"), restaurantdetailProps:userBrowserHistory.location.state.restaurantdetailProps});
      }else{
        userBrowserHistory.push('/stepVerification', {...userBrowserHistory.location.state,location:userBrowserHistory.location.pathname});
      }
    }
    const deleteCartItem = (cartId) => {
      if(context.authenticate){
        console.log("id", cartId)
        context.deleteCartitem(localStorage.getItem("restaurentId"), cartId)
        // userBrowserHistory.push('/cart',{storeId:localStorage.getItem("restaurentId"), restaurantdetailProps:userBrowserHistory.location.state.restaurantdetailProps});
      }else{
        userBrowserHistory.push('/stepVerification', {...userBrowserHistory.location.state,location:userBrowserHistory.location.pathname});
      }
    }
    return (<div className='mt-2' >
            {
                context.cartList.map((item, i)=>
                <div className='mt-2' key={i}>
                    <div className="show-curson-icon d-flex justify-content-between">
                        {/* {item.ProductPictures.length === 0?"":<img src={list.ProductPictures.length === 0?"https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png":list.PictureUrl+"/"+list.ProductPictures[0]?.PictureId + "_" +list.ProductPictures[0]?.SeoFilename+"."+mime.getExtension(list.ProductPictures[0]?.MimeType)} alt="" />} */}
                        {/* <img src={item.ProductPictures.length === 0?"https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png":item.PictureUrl+"/"+item.ProductPictures[0]?.PictureId + "_" +item.ProductPictures[0]?.SeoFilename+"."+mime.getExtension(item.ProductPictures[0]?.MimeType)} alt="" /> */}
                        <img src={item.productPictures[ 0] ? item.productPictures[0].pictureUrl : "https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png"} alt="" style={{height:"58.79px", borderRadius:'10px', width:"19%"}} />
                        {/* <div>{item.quantity}</div> */}
                        <div className="input-group w-auto justify-content-between align-items-center" style={{flexWrap:"unset"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="30" viewBox="0 0 34 34" fill="none" style={{marginRight:'2px'}} onClick={()=>deleteCartItem(item.id)} >
                              <rect opacity="0.1" width="34" height="34" rx="5" fill="#F15F38"/>
                              <path d="M7.7334 11.1418H9.7334H25.7334" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M12.7334 11.1418V9.14185C12.7334 8.61141 12.9441 8.1027 13.3192 7.72763C13.6943 7.35256 14.203 7.14185 14.7334 7.14185H18.7334C19.2638 7.14185 19.7725 7.35256 20.1476 7.72763C20.5227 8.1027 20.7334 8.61141 20.7334 9.14185V11.1418M23.7334 11.1418V25.1418C23.7334 25.6723 23.5227 26.181 23.1476 26.5561C22.7725 26.9311 22.2638 27.1418 21.7334 27.1418H11.7334C11.203 27.1418 10.6943 26.9311 10.3192 26.5561C9.94411 26.181 9.7334 25.6723 9.7334 25.1418V11.1418H23.7334Z" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M14.7334 16.1418V22.1418" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M18.7334 16.1418V22.1418" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <input type="button" value="+" className="button-plus border icon-shape quantity-increament-icon" data-field="quantity"/>
                            <input type="button" value={item.quantity} className="border quantity-increament-icon qunatity-icon-data" />
                            <input type="button" value="-" className="button-minus border icon-shape quantity-increament-icon" data-field="quantity"/>
                        </div>
                    </div>
                    <div className="show-curson-icon d-flex justify-content-between">
                        <span className='buttonheaderData' >{item.name}</span>
                        <span className='buttonheaderData' >$ {item.price.toFixed(2)}</span>
                    </div>
                    <span className="inventory-content three-dots" title={item.shortDescription}>{item.shortDescription} </span>
                </div>
                )
            }
            {/* {context.cartList.length === 0 ? null:<button className="btn btn-primary button-primary w-100 mt-2" type="submit" onClick={navigateToCartOrSignIn} >Place order $ {context.cartTotalAmount.toFixed(2)}</button>} */}
            {context.cartList.length === 0 ? null:<button className="btn btn-primary button-primary w-100 mt-2" type="submit" onClick={navigateToCartOrSignIn} >Next</button>}
      </div>
    );
  }
export default CartListDetail;