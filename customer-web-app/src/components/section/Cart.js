import React, { Component } from 'react';
import { DataContext } from '../Context';
import '../css/MenuItems.css';
// import menu from './RestaurantMenu.json';
import Popup from './Popup';
import hotel from '../svg/restaurants-32.png';
import CartForm from './cartForm/form';
import userBrowserHistory from '../History';
import AlertData from "./alert";
import Loading from "./loading";

export class Cart extends Component {

    static contextType = DataContext;
    
    state = {
        showPopup: false,
        tipAmount:0.00,
        show:false,
        message:"",
        styles:"alert-success"
    };

    componentDidMount() {
        this.context.yellowBlurHiddenFunction(false);
        if(this.context.authenticate){
            if(this.props.location.state){
                this.context.getCartlength(this.props.location.state?.storeId || this.props.location.state?.restaurantdetailProps?.restaurantID)
            }
        }else{
            userBrowserHistory.push("/")
        }
    }

    navigateToCatergories = (storeId, productId, storeName) => {
        userBrowserHistory.push('/restaurant/categories',{storeId:storeId, productId:productId, storeData:storeName})
    }
    navigateToInventory = (storeId, productId, storeName) => {
        userBrowserHistory.push('/inventoryList',userBrowserHistory.location.state)
    }
    render() {
        const cartList = this.context.cartList;
        return (
            <div>
                <Loading loading={this.context.loading}/>
                <AlertData show={this.context.alertDisplay} style={this.context.styleList} message={this.context.message} />
                <div id="cartItems" className="container pt100">
                
                    <div className="row">
                        <div className="col-sm-2"></div>
                        <div className="col-sm-8">

                            <div className="cart-block zig-zag-bottom">

                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="hotel-name">
                                            <img src={hotel} alt="" />
                                            <h3 className="cart-title">{localStorage.getItem("storeName")}</h3>
                                        </div>
                                    </div>
                                    {cartList.length === 0?<div></div>:
                                        cartList.map((item, i) => {
                                            
                                            return (
                                                <div className="row" key={i}>
                                                    <div className="col-sm-3 " onClick={() => this.navigateToInventory(item.storeId, item.productId,this.context.storeName)} >
                                                        <div className="restaurantCardtypebox-ex  ">
                                                            <div className="show-curson-icon" >
                                                                <img src={item.productPictures[ 0] ? item.productPictures[0].pictureUrl : "https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png"} alt="" />
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="col-sm-9 ">
                                                        <div className="mt-3">
                                                            <div className="">
                                                                <div className="row mb-3">
                                                                    <div className="col-9">
                                                                        <h4 className="cart-item-inventory-name ff-poppins"> {item.name} </h4>
                                                                    </div>
                                                                    <div className="col-3 cart-item-center">
                                                                        <span> {item.quantity} </span><br/>
                                                                        <span> Quantity </span>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-9">
                                                                    {item.productAttributes.map((user) => (
                                                                        <>
                                                                            <div className="d-flex attribute-data-css">
                                                                                <span  className="me-2" title={user.name}>{user.name+": "} </span>
                                                                                {user.productAttributeValues.map((values) => (
                                                                                        <span  className="" title={values.name}>{values.name} </span>
                                                                                ))}
                                                                            </div>
                                                                        </>
                                                                    ))}
                                                                    </div>
                                                                    <div className="col-3 cart-item-center">
                                                                        <span> $ {item.price.toFixed(2)} </span>
                                                                {/* <button onClick={this.togglePopup.bind(this)} className="btn cta-bgbtn mt-0 float-right"> Click Here to Pay</button> */}
                                                                    </div>
                                                            </div>

                                                            <div className="row">
                                                                    <div className="col-sm-12">
                                                            {
                                                                    this.state.showPopup ?
                                                                        <Popup text='Close Me' />
                                                                        : null
                                                                }
                                                                </div>
                                                                </div>

                                                            </div>
                                                        </div>


                                                    </div>
                                                </div>
                                            )}
                                        )
                                    }
                                    <CartForm  cart={cartList} context={this.context} state={this.state} />
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Cart
