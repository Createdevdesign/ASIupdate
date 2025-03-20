import React, { useState } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  // CardElement,
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement
} from '@stripe/react-stripe-js';
import '../../css/payment.css';

const CheckoutForm = ({context, handleClose, addCard}) => {
  const stripe = useStripe();
  
  const elements = useElements();
  const [error, setError] = useState(null);
  const [show, setShow] = useState(true);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (elements == null) {
      return;
    }

    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      // card: elements.getElement(CardElement),
      card: elements.getElement(CardNumberElement)
      // card: elements.getElement(CardExpiryElement),
      // card: elements.getElement(CardCvcElement),
    });
    if(error){
      
     
      // let serviceType = "ANONYMOUS"
      // if(this.state.authenticate){
      //   serviceType = "CUSTOMER"
      // }
      // context.commonRefreshToken(serviceType)
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 2000);
    }else{
      if(paymentMethod){
        setShow(false)
        handleClose()
        console.log("addCard", addCard)
        if(addCard === "Save card"){
          context.attachCard(paymentMethod.id);
        }
        if(addCard === "Add card"){
          localStorage.setItem("paymentMethod",paymentMethod.id)
        }
        
      }
    }
    // if()
    
  };
  // const options = {
  //   style: {
  //     base: {
  //       color: "#32325d",
  //       fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  //       fontSmoothing: "antialiased",
  //       fontSize: "16px",
  //       "::placeholder": {
  //         color: "#aab7c4"
  //       }
  //     },
  //     invalid: {
  //       color: "#fa755a",
  //       iconColor: "#fa755a"
  //     }
  //   }
  // };
  const handleChange = (change) => {
    console.log('[change]', change);
  };
  console.log("show", show)
  return (<>
  {show?
    <form onClick={handleSubmit}>
      {/* <CardCvcElement name="ccnumber" /> */}
      <label className='stripeLabel'>
        Card number
        <CardNumberElement onChange={handleChange} />
      </label>
      
      <div style={{display:"flex", justifyContent:"space-between"}}>
        <label className='stripeLabel'>
          Cvc
          <CardCvcElement onChange={handleChange} />
        </label>
        <div style={{width:"10%"}}></div>
        <label className='stripeLabel'>
          Expiration date
          <CardExpiryElement onChange={handleChange} />
        </label>
      </div>
      
      {/* <CardElement className="sr-input sr-card-element" options={options} /> */}
      {error && <div className="message sr-field-error">{error}</div>}
      <button className="btn btn-primary button-primary w-100 mt-3" disabled={!stripe || !elements} type="submit">Add card</button>
      {/* <button type="submit" disabled={!stripe || !elements} className="btn btn-primary add-item-button green-color" >Add</button> */}
    </form>:null}
  </>
    
  );
};

const stripePromise = loadStripe('pk_test_51HSFbLDGjO2LxK5YGl3eN9hvilQNYh5vuPcjdtw7kozDmn4DE5PnGTjyvjQYMH35N62qJitn4ausDEaxoXGn2WD800ExHevErm');

const stripeCard = ({ context, handleClose, addCard }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm context={context} handleClose={handleClose} addCard={addCard} />
  </Elements>
);
export default stripeCard;