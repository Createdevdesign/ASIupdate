import React, { Component } from 'react';
import {DataContext} from '../../../Context';
import '../../../css/orderhistory.css';
// import userBrowserHistory from '../../../History';
import Loading from "../../loading";
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import moment from 'moment';

export class OrderHistory extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            addressBook: [],
            deliveryTypes:{
                'PICKUP':'rgba(236, 247, 241, 0.8)',
                'DELIVERY':'#FFE9E9',
            },
            deliveryTypebackGround:{
                'PICKUP':'#41AA78',
                'DELIVERY':'#E96C64',
            }
        };
     
    }
    getOrderHistoryList = () => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get('/api/orders/v1/me?statuses=COMPLETE,CANCELLED', {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
              this.setState({ addressBook : res.data?.data});
            this.context.loadingFunction(false)
          })
          .catch(err => {
            console.log("get user profile error", err.response)
            if(err.response?.data?.message === "jwt expired"){
              let serviceType = "ANONYMOUS"
              if(this.state.authenticate){
                serviceType = "CUSTOMER"
              }
              this.context.commonRefreshToken(serviceType)
            }
            this.context.loadingFunction(false);
          });
    }

    componentDidMount(){
        this.context.yellowBlurHiddenFunction(false);
        this.getOrderHistoryList();
    }
    render() {
        return (
            <>
            <Loading loading={this.context.loading}/>
            <div id = "restaurant" className="container menuItems">
                <div className="row borderTopCss paddingAddress" > 
                    <div className="d-flex justify-content-between" style={{minHeight:"80px", paddingTop:"10px"}}>
                        <h3  className="show-curson-icon" style={{fontFamily: "Righteous", fontStyle:"normal", fontWeight:"400", fontSize: '36px', lineHeight: "45px", color: "#23212A"}} >
                            Order History
                        </h3>
                    </div>
                    <Table striped bordered hover>
                        {/* <thead>
                            <tr>
                            <th>Address</th>
                            <th>Action</th>
                            </tr>
                        </thead> */}
                        <tbody>
                            {this.state.addressBook.length === 0?<tr>
                                <td className='inventory-title' style={{ textAlign:'center', display:'grid' }} >
                                    No Order found
                                </td>
                            </tr>:
                            this.state.addressBook.map((item, index) => (<tr>
                            <td>
                                <div className='d-flex justify-content-between backgroundInherit'>
                                <span className='backgroundInherit'>
                                    <div className='inventory-title backgroundInherit cursor-pointer'>
                                        {item.FirstName} {item.LastName} ({item.OrderNumber}) 
                                    </div >
                                    <div className='inventory-content backgroundInherit h-auto'>
                                        Created On {moment(item.CreatedOnUtc).format('LLL')}.
                                    </div>
                                    <div className='inventory-title backgroundInherit cursor-pointer'>
                                    $ {item.OrderTotal}.
                                    </div >
                                </span>
                                 <span className='backgroundInherit'>
                                    <div className='deliveryTypeCss backgroundInherit cursor-pointer' style={{background:this.state.deliveryTypes[item.DeliveryType] === undefined?'green':this.state.deliveryTypes[item.DeliveryType], padding:'5px 10px', color:this.state.deliveryTypebackGround[item.DeliveryType]===undefined?'black':this.state.deliveryTypebackGround[item.DeliveryType] }} >
                                        {item.DeliveryType === 'PICKUP'?'PICKUP-IN-STORE':item.DeliveryType}
                                    </div >
                                 </span>
                                 </div>
                                 </td>
                                
                                
                            </tr>))}
                        </tbody>
                        </Table>
                </div>
            </div></>
        )
    }
}

export default OrderHistory;