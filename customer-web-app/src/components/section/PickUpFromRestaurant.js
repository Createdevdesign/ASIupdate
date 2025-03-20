import React, { Component } from 'react';
import '../css/Restaurants.css';
import userBrowserHistory from '../History';
import hotel from '../svg/restaurants-32.png';

export class PickUpFromRestaurant extends Component {

    handleOnRestarantClick = (restaurant) => {
        if (restaurant.IsOpen) {
            const params = { restaurantID: restaurant._id, restaurantName: restaurant.Name, restaurantImage: restaurant.Image, restaurantAddress1: restaurant.Address.Address1, restaurantAddress2: restaurant.Address.Address2, restaurantCity: restaurant.Address.City, restaurantState: restaurant.Address.State, restaurantPin: restaurant.Address.ZipPostalCode, restaurantTimings: restaurant.StoreHours, isDeliveryEnabled: restaurant.IsDeliveryEnabled, isPickUpEnabled: restaurant.IsPickupEnabled, isRestaurantOpen: restaurant.IsOpen }
            userBrowserHistory.push(`/inventoryList`,
                {
                    restaurantdetailProps: params
                });
        } else {
            alert('Restarant Is Closed, Please try Again After Sometime!');
        }
    }

    navigateToStoreCalendar = () => {
        const params = {
            restaurantID: this.props.restaurantID,
            restaurantName: this.props.restaurantName,
            restaurantImage: this.props.restaurantImage,
            restaurantAddress1: this.props.restaurantAddress1,
            restaurantAddress2: this.props.restaurantAddress2,
            restaurantCity: this.props.restaurantCity,
            restaurantState: this.props.restaurantState,
            restaurantPin: this.props.restaurantPin,
            restaurantTimings: this.props.restaurantTimings,
            isDeliveryEnabled: this.props.isDeliveryEnabled,
            isPickUpEnabled: this.props.isPickUpEnabled,
            isRestaurantOpen: this.props.isRestaurantOpen
        };
        userBrowserHistory.push("/restaurant/storecalender", {
            restaurantdetailProps : params
        });
    }
    render() {
        return (
            <div className="container pt100" >
                <div className="row">
                    <div className="col-sm-12">
                        <div className="pickupFromRestaurant">
                     <div className="pickUpHeader">
                                <div className="row">
                                    <div className="col-sm-12 align-self-center">
                                        <div className="hotel-name">
                                            <img src={hotel} alt="" />
                                            <h3>{localStorage.getItem("storeName")} </h3>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 align-self-center">
                                        <p className="restaurantPickUpAddress3 mt-2" >
                                            <span className="label-head">Today's store house </span>
                                            <span className="label-body">
                                                {this.props.restaurantTimings}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-sm-6 align-self-center">
                                        <p className="restaurantPickUpAddress  mt-2">
                                            <span className="label-head"> Address </span>
                                            <span className="label-body">
                                                {this.props.restaurantAddress1} , {this.props.restaurantAddress2} , {this.props.restaurantCity} , {this.props.restaurantState} , {this.props.restaurantPin} </span></p>
                                    </div>
                                </div>
                            </div>
                         

                            <div className="pickUpBody mb-0 mt-0">
                                <div className="restaurantCardtypebox mt-3"> 
                                <div className="row">
                                    <div className="col-sm-12 text-center">
                                        <div className="schedule-sec mt-0">

                                            <h2> Order Now </h2>
                                            <p className="restaurantPickUpAddress2"> Skip the line and head straight to our To Go area when you arrive </p>
                                        </div>
                                    </div>
                                    <div className="col-sm-5  text-center">
                                        <div className="schedule-sec">
                                            <h4 className="cursor-pointer" onClick={this.navigateToStoreCalendar}>
                                                 Pick Up
                                            </h4>
                                            <p className="restaurantPickUpAddress2"> The store is not available for home delivery</p>
                                        </div>
                                    </div>
                                    <div className="col-sm-2 align-self-center text-center">

                                        <span className="or-mid"> OR   </span>
                                    </div>
                                    <div className="col-sm-5  text-center align-self-center">
                                        <div className="schedule-sec">
                                            <h4>
                                                Delivery
                                                {/* <a href="" className> Delivery </a> */}
                                            </h4>
                                            <p className="restaurantPickUpAddress2"> The store is not available for home delivery</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PickUpFromRestaurant