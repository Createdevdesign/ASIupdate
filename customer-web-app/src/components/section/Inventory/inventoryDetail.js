import React, { useState } from 'react';
import '../../css/Inventory.css';
import {Modal } from 'react-bootstrap';
// import StoreTimingTabs from './storeTimingTabs';
import Crossbutton from '../../svg/cross_button.svg';
import InventoryAccordian from './inventoryAccordian';
import userBrowserHistory from '../../History';

function MyVerticallyCenteredModal(props) {
  const [quatity, setQuantity] = useState(1);
  const [additionalComment, setAdditionalComments] = useState("");
  
  const [productAttibuteData, setProductAttibuteData] = useState([]);
  
  const [productAttributeFinalData, setProductAttributeFinalData] = useState([]);
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
  const navigateToCartOrSignIn = () => {
    if(props.context.authenticate){
      let data = {
        "Attributes": {
          // "ProductAttribute":this.state.ProductAttributeFinalData
          ProductAttribute:productAttributeFinalData
        },
        ShoppingCartType:2,
        ShoppingCartTypeId:5,
        ProductId:props.storeapidata?._id,
        Quantity:quatity,
        "Duration": "",
        "AdditionalComments": additionalComment,
        "DeliveryTime":"",
      }
      props.context.addToCart(data, localStorage.getItem("restaurentId"), userBrowserHistory);
      
      userBrowserHistory.push('/cart',{storeId:localStorage.getItem("restaurentId"), restaurantdetailProps:userBrowserHistory.location.state.restaurantdetailProps});
    }else{
      userBrowserHistory.push('/stepVerification', {...userBrowserHistory.location.state,location:userBrowserHistory.location.pathname});
    }
  }
  const handleChange = (event, name) => {
    if(name === "additionComments"){
      setAdditionalComments(event.target.value);
    }  
  }
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
  
    return (
      <Modal
        {...props}
        size={props.storeapidata?.ProductPictures?.length !== 0 ?"xl":"lg"}
        
        dialogClassName='modal-90w dialogBoxClass inventoryDetailDialogBox'
        aria-labelledby="contained-modal-title-vcenter"
        style={{backgroundColor:"initial", border:"none"}}
        centered
      >
        <Modal.Body className='dialogBoxClass' style={{padding:"0px"}}>
          <span className='crossButtonCss'>
            <img src={Crossbutton} className="cursor-pointer" alt="" onClick={props.onHide} style={{
            background:"none", float:"right"
            }} />
          </span>
          <div className='row' style={{ borderRadius:"15px" }}>
            <div className={props.storeapidata?.ProductPictures?.length === 0 ?'col-md-12':'col-md-6'} style={{ borderRadius:"15px", minHeight:"500px" }}>
              <div style={{margin:"38px 20px"}} >
                <div className='inventoryDetailName' >{props.storeapidata?.Name}</div>
                <div className='inventoryDetailDescription'>{props.storeapidata?.FullDescription}</div>
                <InventoryAccordian ProductAttributes={props.storeapidata?.ProductAttributes === undefined?[]:props.storeapidata?.ProductAttributes} onChange={handleProductAttributesChange} />
                <button className='panel__label mt-2'>Special instructions</button>
                <textarea className="form-control mb-2 mt-2" id="exampleFormControlTextarea1" rows="2" onChange={(e)=> handleChange(e, "additionComments")} value={additionalComment} ></textarea>
                <div className='row'>
                  <div className='col-md-4'>
                      <div className="input-group w-auto justify-content-between align-items-center" style={{flexWrap:"unset"}}>
                        <input type="button" value="+" className="button-plus border icon-shape quantity-increament-icon" data-field="quantity" onClick={(e) => quantityIncreament("positive",quatity + 1)}/>
                        <input type="button" value={quatity} className="border quantity-increament-icon" style={{background:"none", fontWeight:"bold", fontSize:"18px"}} />
                        <input type="button" value="-" className="button-minus border icon-shape quantity-increament-icon" data-field="quantity" onClick={(e) => quantityIncreament("negative",quatity - 1)}/>
                      </div>
                  </div>
                  <div className='col-md-8'>
                    <button className="btn checkOutButton" onClick={navigateToCartOrSignIn} > Go to Checkout  </button>
                  </div>
                </div>
              </div>
                
              {/* <div><button onClick={()=>userBrowserHistory.push("/cart")} >Go to checkout</button></div> */}
            </div>
            {props.storeapidata?.ProductPictures?.length !== 0 ?
              <div className='col-md-6 menuimg-fit' style={{ 
                            backgroundImage: props.storeapidata?.ProductPictures === undefined?null:`url(${props.storeapidata?.ProductPictures[0].pictureUrl})` ,
                            backgroundSize: "100% 100%",
                            minHeight:"500px",
                            borderRadius:"0px 15px 15px 0px",
                            paddingTop:"1%"
                            }}>
            </div>:null}
          </div>
            {/* <div className="bg-none">
                <div className="inventoryDetailCard justify-content-between" >
                  <div className="content show-curson-icon p-2" >
                    <span  className="inventory-title three-dots"  >{"list.Name"} </span>
                    <span  className="inventory-content three-dots">{"list.ShortDescription"} </span>
                    <div className="">
                      <span  className="pm-2 inventory-price"> $ </span>
                    </div>
                </div>
                <div className="show-curson-icon menuimg-fit"style={{ 
                            backgroundImage: `url(${localStorage.getItem("storeImage")})` ,
                            backgroundSize: "100% 100%",
                            height:"500px",
                            width:"100%",
                            borderRadius:"0px 15px 15px 0px",
                            padding:"1% 1% 0% 0%"
                            }}>
                    <img src={Crossbutton} className="cursor-pointer" alt="" onClick={props.onHide} style={{background:"none", float:"right"}} />
                  </div>
                </div>
              
            </div> */}
        </Modal.Body>
        {/* <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer> */}
      </Modal>
    );
}
  
function InventoryDetail({inventoryShow, inventorySetShow, storeapidata, context}) {
    return (
      <>
        <MyVerticallyCenteredModal
          show={inventoryShow}
          onHide={() => inventorySetShow(false)}
          storeapidata={storeapidata}
          context={context}
        />
      </>
    );
  }
export default InventoryDetail;