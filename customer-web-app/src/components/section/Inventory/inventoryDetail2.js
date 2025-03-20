import React, { useState } from 'react';
import '../../css/Inventory.css';
import InventoryAccordian from './inventoryAccordian';
import Crossbutton from '../../svg/cross_button.svg';
import userBrowserHistory from '../../History';

function InventoryDetail({ inventorySetShow, inventoryDetailData, context}) {
  const [quatity, setQuantity] = useState(1);
  const [additionalComment, setAdditionalComments] = useState("");
  
  const [productAttibuteData, setProductAttibuteData] = useState([]);
  
  const [productAttributeFinalData, setProductAttributeFinalData] = useState([]);
  
  const handleProductAttributesChange = (booleanValue, value, selectOptionSetter, index) => {
    if(booleanValue === true){
      let item = productAttributeFinalData
      let dropdownData = productAttibuteData;
      let datafinal = dropdownData.filter(e => e['index'] === index)
      if(datafinal.length === 0){
        dropdownData.push({[index]:value, "index":index});
        item.push({ID:selectOptionSetter, ProductAttributeValue:[{Value:value}]});
      }else{
        dropdownData.forEach(element => {
          if(element["index"] === index){
            element[index] = value;
          }
        });
        item.forEach(element => {
          if(element["ID"] === selectOptionSetter){
            // element[index] = value;
            element.ProductAttributeValue.forEach((attributeValue) => {
              if(attributeValue.Value !== value){
                attributeValue.Value = value;
              }
            })
          }
        });
      }
      setProductAttibuteData(dropdownData);
      setProductAttributeFinalData(item);
    }
    
  }
  const quantityIncreament = (name, value) => {
    if(name === "positive"){
      if(quatity < 10) {
        setQuantity(value);
      }
    }
    if(name === "negative"){
      if(quatity > 1) {
        setQuantity(value);
      }
    }
  }
  const handleChange = (event, name) => {
    if(name === "additionComments"){
      setAdditionalComments(event.target.value);
    }  
  }
  const navigateToCartOrSignIn = () => {
    if(context.authenticate){
      let data = {
        "Attributes": {
          // "ProductAttribute":this.state.ProductAttributeFinalData
          ProductAttribute:productAttributeFinalData
        },
        ShoppingCartType:2,
        ShoppingCartTypeId:5,
        ProductId:inventoryDetailData?.data?._id,
        Quantity:quatity,
        "Duration": "",
        "AdditionalComments": additionalComment,
        "DeliveryTime":"",
      }
      context.loadingFunction(true)
      context.addToCart(data, localStorage.getItem("restaurentId"), userBrowserHistory);
      inventorySetShow(false,"data");
      // userBrowserHistory.push('/cart',{storeId:localStorage.getItem("restaurentId"), restaurantdetailProps:userBrowserHistory.location.state.restaurantdetailProps});
    }else{
      userBrowserHistory.push('/stepVerification', {...userBrowserHistory.location.state,location:userBrowserHistory.location.pathname});
    }
  }
  
    return (<div className='mt-2' >
            <div style={{ 
                            backgroundImage: 
                            inventoryDetailData?.data?.ProductPictures!== undefined?inventoryDetailData.data?.ProductPictures[0]?`url(${inventoryDetailData?.data?.ProductPictures[0].pictureUrl})`:`url("https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png")`:`url("https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png")`,
                            // url(${inventoryDetailData?.ProductPictures!== undefined ? inventoryDetailData.ProductPictures[0]?inventoryDetailData.ProductPictures[0].pictureUrl : "https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png" : "https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png"})`,
                            height:"227px",
                            backgroundRepeat:"round"
                            // backgroundSize:"100%"
                            // background-size: cover;
                            }}>
            <span className=''>
              <img src={Crossbutton} className="cursor-pointer" alt="" onClick={()=>inventorySetShow(false,"data")} style={{
                background:"none", float:"right", margin:"10px 10px"
              }} />
            </span>
            </div>
            <div className='inventoryDetailDivWithoutImage' >
              <div className='inventoryDetailName' >{inventoryDetailData?.Name}</div>
              <div className='inventoryDetailDescription'>{inventoryDetailData?.FullDescription}</div>
              <InventoryAccordian ProductAttributes={inventoryDetailData?.ProductAttributes === undefined?[]:inventoryDetailData?.ProductAttributes} onChange={handleProductAttributesChange} />
              <button className='panel__label mt-2'>Special instructions</button>
              <textarea className="form-control mb-2 mt-2" id="exampleFormControlTextarea1" rows="2" onChange={(e)=> handleChange(e, "additionComments")} value={additionalComment} ></textarea>
              <div className='input-group w-auto justify-content-between'>
                  <div>
                    <div className='panel__label' >Quantity</div>
                    <div className="cost" style={{paddingTop:"2px"}} >item</div>
                  </div>
                  <div className="input-group justify-content-between align-items-center" style={{flexWrap:"unset", width:"30%"}}>
                    <input type="button" value="+" className="button-plus border icon-shape quantity-increament-icon" data-field="quantity" onClick={(e) => quantityIncreament("positive",quatity + 1)}/>
                    <input type="button" value={quatity} className="border quantity-increament-icon" style={{background:"none", fontWeight:"bold", fontSize:"18px"}} />
                    <input type="button" value="-" className="button-minus border icon-shape quantity-increament-icon" data-field="quantity" onClick={(e) => quantityIncreament("negative",quatity - 1)}/>
                  </div>
              </div>
              <button className="btn checkOutButton mt-2" onClick={navigateToCartOrSignIn} > ADD TO CART  </button>
            </div>
            
      </div>
    );
  }
export default InventoryDetail;