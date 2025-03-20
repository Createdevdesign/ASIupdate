import React, { Component } from 'react';
import {DataContext} from '../../../Context';
import '../../../css/Restaurants.css';
import '../../../css/address.css';
import userBrowserHistory from '../../../History';
import Loading from "../../loading";
import Table from 'react-bootstrap/Table';
import axios from 'axios';

export class AddressBook extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            addressBook: []
        };
     
    }
    getAddressBook = () => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get('/api/address-book/v1/addresses', {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
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
    deleteAddressBook = (addressId) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.delete('/api/address-book/v1/address/'+addressId, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
            //   this.setState({ addressBook : res.data?.data});
            this.context.errorHandlingFunction(true, "alert-success", "Address is delete success fully"+res?.data?.status);
            // this.context.loadingFunction(false)
            this.getAddressBook();
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
        this.getAddressBook();
    }
    render() {
        return (
            <>
            <Loading loading={this.context.loading}/>
            <div id = "restaurant" className="container menuItems">
                <div className="row borderTopCss paddingAddress" > 
                    <div className="d-flex justify-content-between" style={{minHeight:"80px", paddingTop:"10px"}}>
                        <h3  className="show-curson-icon" style={{fontFamily: "Righteous", fontStyle:"normal", fontWeight:"400", fontSize: '36px', lineHeight: "45px", color: "#23212A"}} >
                            Address Book
                        </h3>
                        
                        <div>
                            <div className="circlePlus" onClick={()=> userBrowserHistory.push('/address/form')}>+</div>
                        </div>
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
                                    No Address found
                                </td>
                            </tr>:
                            this.state.addressBook.map((item, index) => (<tr>
                            <td>
                                <div className='d-flex justify-content-between backgroundInherit'>
                                <span className='backgroundInherit'>
                                    <div className='inventory-title backgroundInherit cursor-pointer'>
                                        {item.FirstName} {item.LastName} {item.Default === true?"(Default)":''}
                                    </div >
                                    <div className='inventory-content backgroundInherit h-auto'>
                                        {item.Address1},  {item.Address2}, {item.City}, {item.ZipPostalCode}. 
                                    </div>
                                </span>
                                 <span className='backgroundInherit'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" style={{background:'inherit', cursor:"pointer", marginRight:'10px'}} onClick={()=> userBrowserHistory.push('/address/form',{addressId:item._id})} >
                                        <rect width="24" height="24" rx="5" fill="#5E41AA" fill-opacity="0.1"/>
                                        <path d="M12.625 16.7008H18.25" stroke="#5E41AA" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M15.4375 6.38833C15.6861 6.13968 16.0234 6 16.375 6C16.5491 6 16.7215 6.03429 16.8824 6.10092C17.0432 6.16755 17.1894 6.26521 17.3125 6.38833C17.4356 6.51144 17.5333 6.6576 17.5999 6.81845C17.6665 6.97931 17.7008 7.15172 17.7008 7.32582C17.7008 7.49993 17.6665 7.67234 17.5999 7.8332C17.5333 7.99405 17.4356 8.14021 17.3125 8.26332L9.5 16.0758L7 16.7008L7.625 14.2008L15.4375 6.38833Z" stroke="#5E41AA" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 34 34" fill="none" style={{background:'inherit', cursor:"pointer"}} onClick={()=>this.deleteAddressBook(item._id)} >
                                        <rect opacity="0.1" width="34" height="34" rx="5" fill="#F15F38"/>
                                        <path d="M7.7334 11.1418H9.7334H25.7334" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12.7334 11.1418V9.14185C12.7334 8.61141 12.9441 8.1027 13.3192 7.72763C13.6943 7.35256 14.203 7.14185 14.7334 7.14185H18.7334C19.2638 7.14185 19.7725 7.35256 20.1476 7.72763C20.5227 8.1027 20.7334 8.61141 20.7334 9.14185V11.1418M23.7334 11.1418V25.1418C23.7334 25.6723 23.5227 26.181 23.1476 26.5561C22.7725 26.9311 22.2638 27.1418 21.7334 27.1418H11.7334C11.203 27.1418 10.6943 26.9311 10.3192 26.5561C9.94411 26.181 9.7334 25.6723 9.7334 25.1418V11.1418H23.7334Z" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M14.7334 16.1418V22.1418" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M18.7334 16.1418V22.1418" stroke="#F15F38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
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

export default AddressBook