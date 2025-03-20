import React, { Component } from 'react';
import {DataContext} from '../Context';
import '../css/Restaurants.css';
import userBrowserHistory from '../History';
import Loading from "./loading";

export class Restaurants extends Component {

    static contextType = DataContext;

    handleOnRestarantClick = (restaurant) =>{
        if(restaurant.IsOpen) {
            // this.context.storeName = restaurant.Name;
            this.context.yellowBlurHiddenFunction(false);
            localStorage.setItem("restaurentId",restaurant._id)
            localStorage.setItem("storeImage", restaurant.Image)
            localStorage.setItem("storeName", restaurant.Name)
            localStorage.setItem("storeAddress", restaurant.Address.Address1 + ", " + restaurant.Address.Address2  + ", " + restaurant.Address.City + ", " + restaurant.Address.State+ " - " + restaurant.Address.ZipPostalCode)
            // localStorage.setItem("storeName", restaurant.Name)
            this.context.getCartlength(restaurant._id);
            // this.context.storeNameFunction(restaurant.Name);
            const  params =  { restaurantID : restaurant._id, restaurantName : restaurant.Name, restaurantImage : restaurant.Image, restaurantAddress1 : restaurant.Address.Address1, restaurantAddress2 : restaurant.Address.Address2, restaurantCity : restaurant.Address.City, restaurantState : restaurant.Address.State, restaurantPin : restaurant.Address.ZipPostalCode, restaurantTimings : restaurant.StoreHours, isDeliveryEnabled : restaurant.IsDeliveryEnabled, isPickUpEnabled : restaurant.IsPickupEnabled, isRestaurantOpen : restaurant.IsOpen}
            userBrowserHistory.push(`/inventoryList`,
            {
                restaurantdetailProps : params
            });
        } 
        // else {
        //     alert('Restarant Is Closed, Please try Again After Sometime!');
        // }
    }

    render() {
        const restaurantsList = this.context.restaurantsList;
        
        return (
            <>
            <Loading loading={this.context.loading}/>
            <div id = "restaurant" className="container menuItems">
                <div className="row"> 
                    <div className="d-flex justify-content-between" style={{minHeight:"80px", paddingTop:"10px"}}>
                        <h3  className="show-curson-icon" style={{fontFamily: "Righteous", fontStyle:"normal", fontWeight:"400", fontSize: '36px', lineHeight: "45px", color: "#23212A"}} >
                            Nearby Restaurant
                        </h3>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect x="0.5" y="0.5" width="39" height="39" rx="4.5" stroke="#F2F2F2"/>
                                <g clipPath="url(#clip0_158_462)">
                                <path d="M27.5001 26.6667L21.6667 26.6667" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.3333 26.6667L12.5 26.6667" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M27.5 20L20 20" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.6667 20L12.5 20" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M27.4999 13.3333L23.3333 13.3333" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20 13.3333L12.5 13.3333" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21.6667 29.1667L21.6667 24.1667" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.6667 22.5L16.6667 17.5" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M23.3333 15.8333L23.3333 10.8333" stroke="#23212A" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_158_462">
                                <rect width="20" height="20" fill="white" transform="translate(10 30) rotate(-90)"/>
                                </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    {
                        restaurantsList.map(restaurant => (
                            <div className="col-sm-4" key = {restaurant._id}>
                                <div className = "restaurantCard" >
                                    <span className="show-curson-icon" onClick={() => this.handleOnRestarantClick(restaurant)}>
                                        {restaurant.Image === ""?
                                        // <div className="div-store-name">
                                            <div className="store-name">
                                                {restaurant.Name.charAt(0)}
                                            </div>
                                        // {/* </div> */}
                                        :<img src = {restaurant.Image} alt = ""/>}
                                    </span>
                                    <div className = "content" style={{padding:"0px 10px 0px"}}>
                                        <div className="d-flex justify-content-between">
                                            <h3  className="show-curson-icon" style={{fontSize: '16px'}} onClick={() => restaurant.IsOpen === true? this.handleOnRestarantClick(restaurant):null} >
                                                {restaurant.Name} 
                                            </h3>
                                            <h3  style={{fontSize: '12px', color:restaurant.IsOpen === true? "#219653":"red", fontWeight:"bold"}} onClick={() => this.handleOnRestarantClick(restaurant)} >
                                                { restaurant.IsOpen === true? "Open":"Close"} 
                                            </h3>
                                        </div>
                                        {
                                            restaurant.Cuisines.map((cuisine, index1) => {
                                                return(
                                                    <p className = "cuisineStyles" key = {index1}>
                                                         {cuisine} {index1 < restaurant.Cuisines.length -1 ? ',\u00A0' : ''} 
                                                    </p> 
                                                )
                                            })
                                        }
                                        <p className = "restaurantAddress"> {restaurant.Address.Address1} , {restaurant.Address.Address2} , {restaurant.Address.City} , {restaurant.Address.State} , {restaurant.Address.ZipPostalCode}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div></>
        )
    }
}

export default Restaurants