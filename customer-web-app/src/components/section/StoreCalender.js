import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import hotel from '../svg/restaurants-32.png';
import checked from '../svg/checked.png';
import moment from 'moment';
import {DataContext} from '../Context';
import Loading  from './loading';

const baseURL = process.env.NODE_ENV === "development"
  ? process.env.REACT_APP_API_ENDPOINT
  : process.env.REACT_APP_API_ENDPOINT

export class StoreCalender extends Component {
    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            storeID: "",
            calenderTimings: []
        };
    }

    componentDidMount() {
        var tempStyle = document.getElementsByClassName("pickupFromRestaurant");
        tempStyle[0].style.display = "none";
        const token = localStorage.getItem("sessionToken")
        const tempStoreId = this.props.location.state.restaurantdetailProps.restaurantID;
        this.setState({storeID : tempStoreId})
        this.context.loadingFunction(true);
        axios.get(`/stores/v1/${tempStoreId}/hours?type=pickup`, {baseURL:baseURL, withCredentials:false,headers : {"authorization" : token, 'x-timezone':this.context.timeZone}})
          .then(res => {
            this.setState({ calenderTimings : res.data.data.availableSchedule})
            this.context.loadingFunction(false)
          })
          .catch(err => {
            this.context.loadingFunction(false)
            console.log(err);
          });
    }
    handleStoreTimings =(storeTimings)=>{
        localStorage.setItem("storeTimings", storeTimings)
    }
    render() {
        const restarantData = this.props.location.state ? this.props.location.state : this.props.location;
        return (
            <>
            <Loading loading={this.context.loading}/>
            <div className="container" >
                <div className="row">
                    <div className="col-sm-12">

                        <div className="pickupFromRestaurantStore">
                            <div className="pickUpHeader">
                                <div className="row">
                                    <div className="col-sm-12 align-self-center">
                                        <div className="hotel-name">
                                            <img src={hotel} alt="" />
                                            <h3> {localStorage.getItem("storeName")} </h3>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 align-self-center">

                                        <p className="restaurantPickUpAddress mt-2" > <span className="label-head">   Today's store house  </span>  <span className="label-body"> {restarantData.restaurantdetailProps.restaurantTimings}  </span>  </p>
                                    </div>
                                    <div className="col-sm-6 align-self-center">
                                        <p className="restaurantPickUpAddress3 mt-2"> <span className="label-head">  Address </span>  <span className="label-body">  {restarantData.restaurantdetailProps.restaurantAddress1} , {restarantData.restaurantdetailProps.restaurantAddress2} , {restarantData.restaurantdetailProps.restaurantCity} , {restarantData.restaurantdetailProps.restaurantState} , {restarantData.restaurantdetailProps.restaurantPin} </span>  </p>
                                    </div>

                                </div>
                            </div>
                            <div className="pickUpBodyStore">

                                <div className="row mt-3">
                                    <div className="col-sm-12">
                                        {/* <h2 className> Pick Up </h2> */}
                                    </div>
                                </div>
                                <div className="htl-box">

                                    <div className="row">
                                        <div className="col-sm-12">
                                            <p className="mb-0 second-head"> Select Time </p>
                                        </div>
                                    </div>

                                    <div className="row">
                                        {
                                            this.state.calenderTimings.map((timing, index) => (
                                                <div key={index} className="col-sm-3">
                                                    <div className="storeDates">
                                                        <h1 className="day-notation"> {moment(timing.date).format('MMMM Do')} </h1>
                                                        {
                                                            timing.timings.map((time, index) => (
                                                                <div id="storeTime" key={index}>
                                                                    <Link to={{ pathname: `/inventoryList`}} onClick={() => this.handleStoreTimings(moment(timing.date).format('MMMM Do')+", "+time)} >
                                                                        <h3>{time}</h3>    
                                                                                <img src={checked} alt="" />
                                                                    </Link>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            </>
        )
    }
}

export default StoreCalender