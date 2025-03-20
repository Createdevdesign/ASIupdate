import React, {  useState } from 'react';
import {Form, Row, Col} from "react-bootstrap";
import axios from 'axios';
import '../../css/MenuItems.css';
import userBrowserHistory from '../../History';
import StripeCard from "../payment/stripeCard";
import {Modal } from 'react-bootstrap';

axios.defaults.withCredentials = true;
// import userBrowserHistory from '../../History';

function FormCart({ cart, context, state}) {
  
    const [validated, setValidated] = useState(false);
    const [formData, setForm] = useState({
        serviceType: localStorage.getItem("selectedServiceType") === "Dine-in"?"Table":localStorage.getItem("selectedServiceType"),
        paymentMethod:"",
        tipAmount:"0",
        selectedCard:context.cardList.length === 0?"":context.cardList[0]['id'],
        addCard:"",
        orderNote:""
    });
    const [paymentIntentIdAndMethod, setPaymentIntentId] = useState("");
    const [serviceTypeArray, setServiceType] = useState([]);
    const [paymentMethodTypes, setPaymentMethodType] = useState([])
    const [show, setShow] = useState(false);
    const [note, showNote] = useState(false);
    React.useEffect(() => {
      let serviceArray=["Table"]
      let paymentMethodDataArray = ['Pay at store']
      if(userBrowserHistory?.location?.state?.restaurantdetailProps?.isDeliveryEnabled || userBrowserHistory?.location?.state?.restaurantdetailProps?.isPickUpEnabled){
        paymentMethodDataArray.push("Select a card");
      }
      if(userBrowserHistory?.location?.state?.restaurantdetailProps?.isDeliveryEnabled){
          serviceArray.push("Delivery");
          paymentMethodDataArray.push("Google pay");
      }
      if(userBrowserHistory?.location?.state?.restaurantdetailProps?.isPickUpEnabled){
          serviceArray.push("Pickup");
      }
      setServiceType(serviceArray)
      setPaymentMethodType(paymentMethodDataArray)
    }, [setServiceType, setPaymentMethodType]);

    const placeOrderApi = (body) => {
      axios.post("/api/cart/v1/PlaceOrder", body,
      {baseURL:context.baseURLNew,withCredentials:false,headers : {"authorization" : "Bearer " + localStorage.getItem("sessionToken")}
      }).then(res => {
        setForm({
          serviceType:localStorage.getItem("selectedServiceType") === "Dine-in"?"Table":localStorage.getItem("selectedServiceType"),
          paymentMethod:"",
          tipAmount:"0",
          addCard:"",
          orderNote:""
        })
        showNote(false)
        context.getCartlength(context.restaurentId)
        context.loadingFunction(false);
        context.errorHandlingFunction(true, "alert-success", "Your order is placed, your order Number is "+res?.data?.placedOrder?.orderNumber);
      })
      .catch(err => {
        context.loadingFunction(false)
        console.log("place order api error", err.response)
        if(err.response?.data?.message === "jwt expired"){
          let serviceType = "ANONYMOUS"
          if(this.state.authenticate){
            serviceType = "CUSTOMER"
          }
          
				  context.responsedKey();
          context.commonRefreshToken(serviceType)
        }
        context.errorHandlingFunction(true, "alert-danger", err.response?.data + "("+err.response?.status+")");
      });
    }
    const paymentIntentApi = (paymentIntentBody,body) => {
      axios.post("/api/payments/v1/payment-intent", paymentIntentBody,
      {baseURL:context.baseURLNew,withCredentials:false,headers : {"authorization" : "Bearer " + localStorage.getItem("sessionToken")}
      }).then(res => {
        localStorage.removeItem("paymentMethod")
        setPaymentIntentId(res.data.id)
        body.paymentIntentId = res.data.id;
        placeOrderApi(body);
      })
      .catch(err => {
        console.log("payment intent error", err.response)
        context.loadingFunction(false)
        localStorage.removeItem("paymentMethod");
        if(err.response?.data?.message === "jwt expired"){
          let serviceType = "ANONYMOUS"
          if(this.state.authenticate){
            serviceType = "CUSTOMER"
          }
          context.commonRefreshToken(serviceType)
        }
        context.errorHandlingFunction(true, "alert-danger", err.response?.data?.errors + "("+err.response?.status+")");
      });
  
    }
   
    const handleSubmit = (event) => {
      const form = event.currentTarget;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();

        setValidated(true);
      }
      event.preventDefault();
      
      if (form.checkValidity() === true) {
        context.restaurentId = localStorage.getItem("restaurentId")
        context.loadingFunction(true)
        
        let body = {
          "storeId": context.restaurentId,
          "promoCode": "",
          "promotionId": "",
          "extId": "",
          "OrderComment": formData.orderNote,
          "orderType": formData.serviceType,
          "selectedTime": localStorage.getItem("storeTimings") === undefined?"Nov 25th,1:30PM":localStorage.getItem("storeTimings"),
          "AddressId": "",
          "token": "",
          "payAtStore": formData.paymentMethod === "Pay at store"?true:false,
          "tipAmount": formData.tipAmount === ""?0.00:parseFloat(formData.tipAmount),
          "paymentIntentId":paymentIntentIdAndMethod
        }
        if(formData.paymentMethod === "Select a card"){
          let paymentIntentBody = {
            "PaymentMethodType": "Card", 
            "StoreId":context.restaurentId,
            "OrderType": formData.serviceType,
            "SelectedTime": localStorage.getItem("storeTimings") === undefined?"Nov 25th,1:30PM":localStorage.getItem("storeTimings"),
            "AddressId": "",
            "PromoCodeId": "",
            "PromoCode": "",
            "TipAmount": formData.tipAmount === ""?0.00:parseFloat(formData.tipAmount),
            // "CardId":localStorage.getItem("paymentMethod") !== undefined || localStorage.getItem("paymentMethod") !== null?localStorage.getItem("paymentMethod"):(formData.selectedCard === ""?context.cardList[0]['id']:formData.selectedCard),
            "CardId":localStorage.getItem("paymentMethod") === undefined || localStorage.getItem("paymentMethod") === null?(formData.selectedCard === ""?context.cardList[0]['id']:formData.selectedCard):localStorage.getItem("paymentMethod"),
            "isTaxRequired": true
          }
          paymentIntentApi(paymentIntentBody, body)
        }else{
          placeOrderApi(body)
        }
      }
    };
    
    const setFormValue = (event) => {
      if(event.target.name === "paymentMethod" && event.target.value === "Select a card"){
        context.getCustomerCardList();
      }
      setForm({...formData, [event.target.name]:event.target.value, addCard:""})
    }
    const addNewCardFunction = (name, value) => {
      setShow(true);
      setForm({...formData, [name]:value})
    }
    const additemsButton = ()=>{
      userBrowserHistory.push("/inventoryList", userBrowserHistory.location.state)
    }
    const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);
    return (
      <>
     <Modal show={show} onHide={handleClose}
      size="xs"
      dialogClassName='modal-90w dialogBoxClass inventoryDetailDialogBox'
      aria-labelledby="contained-modal-title-vcenter"
      style={{backgroundColor:"initial", border:"none"}}
      centered
     >
        <Modal.Header closeButton>
          <Modal.Title>Card</Modal.Title>
        </Modal.Header>
        <Modal.Body className='stripeModalBody'>
          <StripeCard  context={context} handleClose={handleClose} addCard={formData.addCard} />
        </Modal.Body>
      </Modal> 
      <Row className="mb-3 mt-3">
          <Form.Group as={Col} md="4" controlId="">
            <button className="btn btn-primary add-item-button green-color" onClick={additemsButton} >+  Add Items</button>                        
          </Form.Group>  
          <Form.Group as={Col} md="4" controlId="">
            <button className="btn btn-primary add-notes-button black-color" onClick={()=> showNote(true)}>+  Add Notes</button>
          </Form.Group>  
          <Form.Group as={Col} md="4" controlId="">
            <button className="btn btn-primary add-item-button green-color">Add a promocode</button>        
          </Form.Group>  
      </Row>
      <Form noValidate validated={validated} onSubmit={handleSubmit} className="mt-3">
        
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="validationCustom03">
            <Form.Label>Service Type</Form.Label>
            <Form.Select  required name="serviceType" onChange={setFormValue} value={formData.serviceType}>
              <option value="">Select Type *</option>
              {serviceTypeArray.map((item,i) =><option key={i} value={item}>{item}</option>)}
              {/* <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
              <option value="Table">Table</option> */}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select service type.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom04">
            <Form.Label>Payment Method</Form.Label>
            <Form.Select  required name="paymentMethod" onChange={setFormValue} value={formData.paymentMethod}>
              <option value="">Select payment *</option>
              {paymentMethodTypes.map((item,i) => <option value={item} key={i}>{item}</option>)}
              {/* <option value="Pay at store">Pay at store</option>
              <option value="Select card">Select a card</option>
              <option value="Google pay">Google pay</option> */}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a payment method.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom05">
            <Form.Label>Tip amount</Form.Label>
            <Form.Select  name="tipAmount" onChange={setFormValue} value={formData.tipAmount}>
              <option value="0">Select tip *</option>
              <option value="15">15%</option>
              <option value="18">18%</option>
              <option value="20">20%</option>
              {/* <option value="Others">Others</option>
              <option value="None">None</option> */}
            </Form.Select>
          </Form.Group>
        </Row>
        {formData.paymentMethod === "Select a card"?<Row className="mb-3">
        {/* {formData.addCard === "Save card"?<Row className="mb-3"> */}
            <Form.Group as={Col} md="4" controlId="validationCustom06">
              <Form.Label>Select card</Form.Label>
              <Form.Select  required name="selectedCard" onChange={setFormValue} value={context.cardList.length === 0?formData.selectedCard:(formData.selectedCard === ""?context.cardList[0]['id']:formData.selectedCard)}>
                {/* // <option value="">Select card</option> */}
                {/* <option value="Add new card">Add new card</option> */}
                {context.cardList.map((item, i)=><option key={i} value={item.id}>{item.card.brand} {item.card.last4} </option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select a card.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationCustom07">
              <button className="btn btn-primary add-item-button green-color mt-4" onClick={() =>  {addNewCardFunction("addCard","Save card"); }} >Save card</button>        
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationCustom08">
              <Form.Label></Form.Label>
              <button className="btn btn-primary add-item-button green-color mt-4" onClick={() =>  addNewCardFunction("addCard","Add card")} >Add card</button>        
            </Form.Group>
          </Row>:null
        }
        {note? 
          <Row>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Note</Form.Label>
              <Form.Control as="textarea" name="orderNote"  onChange={setFormValue} value={formData.orderNote} rows={3} />
            </Form.Group>
          </Row>:
          null
        }
        <Row className="mb-3">
          <Form.Group as={Col} md="12" controlId="validationCustom03">
            
          <div className="col-sm-12 d-flex justify-content-between mt-3 attribute-data-css">
              <span  className="me-2" >Sub Total </span>
              <span  className="me-2" >$ {(context.cartTotalAmount).toFixed(2) } </span>
          </div>
          <div className="col-sm-12 d-flex justify-content-between mt-3 attribute-data-css">
              <span  className="me-2" >Tip Amount </span>
              <span  className="me-2" >$ {parseFloat(formData.tipAmount).toFixed(2)} </span>
          </div>
          <div className="col-sm-12 d-flex justify-content-between mt-3 cart-item-inventory-name">
              <span  className="me-2" >Grant Total </span>
              <span  className="me-2" >$ {(context.cartTotalAmount === 0? 0.00:context.cartTotalAmount + parseFloat(formData.tipAmount)).toFixed(2)} </span>
          </div>
          </Form.Group>  
        </Row>
        {/* <Button classname="button-primary w-100" type="submit">Place Order</Button> */}
        <button className="btn btn-primary button-primary w-100" type="submit">Place order</button>
      </Form>
      
      </>
    );
}

class CartForm extends React.Component {
  
  render(){

      return(<FormCart cart={this.props.cart} context={this.props.context} state={this.props.state} />)
  }
}
export default CartForm;