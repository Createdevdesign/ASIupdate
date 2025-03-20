import React, { Component } from 'react';
// import Menu from './svg/menu-32.png';
import Close from './svg/close.png';
// import CartIcon from './svg/shopping-bag-32.png';
import Logo from '../images/logo-main.png';
import './css/Header.css';
import { DataContext } from './Context'
import userBrowserHistory from './History';
import Tabs from "./section/Headers/tabs"
import axios from 'axios';

export class Header extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            toggle: false,
            confirm:false,
            yourPick:"Dine-in",
            customerData:{}
        };
    }

    handleRadio = (e) => {
        // single selection
        this.setState({ yourPick: e.target.value })
        
    }
    // state = {
    //     toggle: false,
    //     confirm:false
    // }
    getCustomerData = () => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get('/api/users/v1/me', {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
            this.setState({ customerData : res.data?.data});
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
    menuToggle = () => {
        this.getCustomerData();
        this.setState({ toggle: !this.state.toggle });
    }

    navigateToCart = ()  => {
        userBrowserHistory.push('/cart', userBrowserHistory.location.state);
    }
    navigateToDo = ()  => {
        this.setState({ confirmation: true });
    }
    navigateToVerification = (props) => {
        this.setState({ toggle: this.state.toggle });
        userBrowserHistory.push('/stepVerification', {...userBrowserHistory.location.state, location:userBrowserHistory.location.pathname});
    }
    navigateToLogout = () => {
        localStorage.removeItem('auth')
        localStorage.removeItem('X-SS-DEVICE-ID')
        localStorage.removeItem('sessionToken')
        localStorage.removeItem('storeTimings')
        localStorage.removeItem('storeImage')
        localStorage.removeItem('storeName')
        localStorage.removeItem('restaurentId')
        this.context.responsedKey()
        this.navigateToHome();
        
        this.setState({ toggle: !this.state.toggle });
    }
    navigateToHome = () => {
        this.context.yellowBlurHiddenFunction(true);
        localStorage.removeItem('storeTimings')
        localStorage.removeItem('storeAddress')
        localStorage.removeItem('storeImage')
        localStorage.removeItem('storeName')
        localStorage.removeItem('restaurentId')
        this.context.getCartlength(undefined)
        // userBrowserHistory.push(props.location.state.location, props.location.state)
        userBrowserHistory.push('/');
    }
    render() {
        const { toggle } = this.state;
        const cartList = this.context.cartList;
        let authenticate = this.context.authenticate;
        return (
            <div className="">
                {this.context.yellowBlur === true ?<div className="filterBlur"></div>:null}
                
                <header className="header-clr">
                {/* <div className="filterBlur"></div> */}
                {/* <div className="filterBlur"></div> */}
                    <div className="container menuItems">
                        <div className="row">
                            <div className={authenticate === null?"col-xs-6 col-sm-4 col-md-2 col-lg-2":"col-xs-6 col-sm-4 col-md-2 col-lg-2 imagewidth"}>
                                <div className="logo cursor-pointer w-100" onClick={this.navigateToHome}>
                                    <img src={Logo} alt="" width="100%" className='w-100' />
                                </div>
                            </div>
                            <div className={authenticate === null? "col-xs-6 col-sm-1 col-md-2 col-lg-6 ":"col-xs-6 col-sm-8 col-md-5 col-lg-4 tabsWidth"}>
                            {authenticate === null ? null:
                                    this.context.yellowBlur === true?<div className="" style={{border: "1px solid #F2F2F2", display:"flex", float: "right"}}>
                                        <Tabs handleSelected={this.handleRadio} arrayData={[ 'Dine-in','Pickup', 'Delivery']} selectedValue={this.state.yourPick} />
                                    </div>:null
                                }
                            </div>
                             
                            <div className={authenticate === null? "col-xs-6 col-sm-7 col-md-8 col-lg-4 d-flex justify-content-end":"col-xs-6 col-sm-12 col-md-5 col-lg-6 d-flex justify-content-end"}>
                                <div className={authenticate === null? 
                                        "mediaWidthInputField align-self-center me-3":
                                        "mediaWidthInputField align-self-center me-3"} style={{width:"100%"}}>
                                        <div className="headerSearch"> 
                                            <span className="fa-search">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M14.0001 14L11.1001 11.1" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                            <input type="text" className="form-control" placeholder="What are you craving?"/> 
                                        </div>
                                    </div>
                                    {authenticate === null?null:<div className="headerSearch me-3" style={{width:"80%"}}> 
                                            <span className="fa-search">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                    <path d="M12 6.5C12 10 7.5 13 7.5 13C7.5 13 3 10 3 6.5C3 5.30653 3.47411 4.16193 4.31802 3.31802C5.16193 2.47411 6.30653 2 7.5 2C8.69347 2 9.83807 2.47411 10.682 3.31802C11.5259 4.16193 12 5.30653 12 6.5Z" stroke="#5E41AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M7.5 8C8.32843 8 9 7.32843 9 6.5C9 5.67157 8.32843 5 7.5 5C6.67157 5 6 5.67157 6 6.5C6 7.32843 6.67157 8 7.5 8Z" stroke="#5E41AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                            <select className="form-select headerDropdownField" aria-label=".form-select-sm Default select example">
                                                {/* <option selected>Open this select menu</option> */}
                                                <option value="1" >New York, USA</option>
                                                <option value="2">New York, USA</option>
                                                <option value="3">New York, USA</option>
                                            </select>
                                        </div>}
                                        {authenticate === null?null
                                                    :<div className={authenticate === null? 
                                                    "align-self-center me-3":
                                                    "align-self-center me-3"}>
                                                    <nav>
                                                        <ul className={toggle ? "toggle" : ""} onClick={this.menuToggle} style={{ display:toggle ? "inline-block" : "none", width: "100%",background: "#23212A", opacity: 0.5}}>
                                                            
                                                        </ul>
                                                        <ul className={toggle ? "toggle p-5" : ""} style={{ width:"32%", opacity: 1}}>
                                                                {/* <li className="toggleUserImageList">
                                                                        <img src={Close} alt=""  />
                                                                <div className="usernameDiv">
                                                                    <div className="usernameFontDiv">Trupti Mandani</div>
                                                                    <div className="usernameViewAccount">View account</div>
                                                                </div></li> */}
                                                                <li className="w-100 m-6 cursor-pointer" >
                                                                    <div className="d-flex flex-wrap">
                                                                        <div className="toggleUserImageList me-2">
                                                                            <img src={this.state.customerData?.ProfileImage === ""?Close:this.state.customerData?.ProfileImage} alt=""  />
                                                                        </div>
                                                                        
                                                                        <div className="usernameDiv me-2 p-2">
                                                                        <div className="usernameFontDiv">{this.state.customerData?.DisplayName}</div>
                                                                        <div className="usernameViewAccount" onClick={()=>{userBrowserHistory.push('/profile'); this.menuToggle();}}>View account</div>
                                                                    </div>
                                                                    </div>
                                                                </li>
                                                                <li className="cursor-pointer" >
                                                                     <div className="d-flex  flex-wrap align-content-center"> 
                                                                         <div className="me-4">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                                <g clipPath="url(#clip0_271_252)">
                                                                                <path d="M14.4689 3.20834H2.28141C1.53353 3.20834 0.927246 3.81462 0.927246 4.56251V12.6875C0.927246 13.4354 1.53353 14.0417 2.28141 14.0417H14.4689C15.2168 14.0417 15.8231 13.4354 15.8231 12.6875V4.56251C15.8231 3.81462 15.2168 3.20834 14.4689 3.20834Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M0.927246 7.27084H15.8231" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                </g>
                                                                                <defs>
                                                                                <clipPath id="clip0_271_252">
                                                                                <rect width="16.25" height="16.25" fill="white" transform="translate(0.25 0.5)"/>
                                                                                </clipPath>
                                                                                </defs>
                                                                            </svg>
                                                                         </div>
                                                                        
                                                                        <div >
                                                                            Payments 
                                                                         </div>
                                                                         
                                                                    </div>
                                                                     
                                                                </li>
                                                                <li className="cursor-pointer" >  
                                                                    <div className="d-flex  flex-wrap align-content-center"> 
                                                                         <div className="me-4">
                                                                         <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                            <path d="M2.9585 13.4531C2.9585 13.0042 3.13683 12.5736 3.45428 12.2562C3.77172 11.9388 4.20227 11.7604 4.6512 11.7604H13.7918" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            <path d="M4.6512 1.60417H13.7918V15.1458H4.6512C4.20227 15.1458 3.77172 14.9675 3.45428 14.6501C3.13683 14.3326 2.9585 13.9021 2.9585 13.4531V3.29688C2.9585 2.84795 3.13683 2.4174 3.45428 2.09995C3.77172 1.78251 4.20227 1.60417 4.6512 1.60417V1.60417Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>                                                                         
                                                                        </div>
                                                                        
                                                                        <div onClick={()=>{userBrowserHistory.push('/address'); this.menuToggle();}}>
                                                                            Address Book 
                                                                         </div>
                                                                         
                                                                    </div>
                                                                    
                                                                </li>
                                                                <li className="cursor-pointer" onClick={()=>{userBrowserHistory.push('/order-history'); this.menuToggle();}}>
                                                                    <div className="d-flex  flex-wrap align-content-center"> 
                                                                         <div className="me-4">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                                <g clipPath="url(#clip0_271_262)">
                                                                                <path d="M12.0103 1.17711L14.7186 3.88544L12.0103 6.59378" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M2.53125 7.94789V6.59372C2.53125 5.87543 2.81659 5.18655 3.3245 4.67864C3.83241 4.17073 4.52129 3.88539 5.23958 3.88539H14.7187" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M5.23958 16.0729L2.53125 13.3646L5.23958 10.6562" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M14.7187 9.30211V10.6563C14.7187 11.3746 14.4334 12.0634 13.9255 12.5714C13.4176 13.0793 12.7287 13.3646 12.0104 13.3646H2.53125" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                </g>
                                                                                <defs>
                                                                                <clipPath id="clip0_271_262">
                                                                                <rect width="16.25" height="16.25" fill="white" transform="translate(0.5 0.5)"/>
                                                                                </clipPath>
                                                                                </defs>
                                                                            </svg>
                                                                        </div>
                                                                        
                                                                        <div >
                                                                            Order History
                                                                         </div>
                                                                         
                                                                    </div>  
                                                                </li>
                                                                <li className="cursor-pointer" onClick={()=>{userBrowserHistory.push('/notifications'); this.menuToggle();}}>
                                                                    <div className="d-flex  flex-wrap align-content-center"> 
                                                                        <div className="me-4">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                                <path d="M12.6875 5.66665C12.6875 4.58921 12.2595 3.55589 11.4976 2.79403C10.7358 2.03216 9.70244 1.60415 8.625 1.60415C7.54756 1.60415 6.51425 2.03216 5.75238 2.79403C4.99051 3.55589 4.5625 4.58921 4.5625 5.66665C4.5625 10.4062 2.53125 11.7604 2.53125 11.7604H14.7187C14.7187 11.7604 12.6875 10.4062 12.6875 5.66665Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M9.79632 14.4688C9.67728 14.674 9.50642 14.8443 9.30085 14.9627C9.09528 15.0811 8.8622 15.1434 8.62497 15.1434C8.38773 15.1434 8.15466 15.0811 7.94908 14.9627C7.74351 14.8443 7.57265 14.674 7.45361 14.4688" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>
                                                                        </div>
                                                                        <div >
                                                                            Notifications
                                                                         </div>
                                                                         
                                                                    </div>  
                                                                </li>
                                                                <li className="cursor-pointer" >
                                                                    <div className="d-flex  flex-wrap align-content-center"> 
                                                                         <div className="me-4">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                                <path d="M8.62484 15.3958C12.3643 15.3958 15.3957 12.3644 15.3957 8.62498C15.3957 4.88555 12.3643 1.85415 8.62484 1.85415C4.88541 1.85415 1.854 4.88555 1.854 8.62498C1.854 12.3644 4.88541 15.3958 8.62484 15.3958Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M6.65479 6.59376C6.81397 6.14124 7.12817 5.75966 7.54173 5.51661C7.9553 5.27355 8.44154 5.1847 8.91433 5.2658C9.38713 5.3469 9.81596 5.59271 10.1249 5.95969C10.4338 6.32667 10.6029 6.79114 10.6022 7.27084C10.6022 8.62501 8.57093 9.30209 8.57093 9.30209" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M8.625 12.0104H8.63177" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>
                                                                         </div>
                                                                        
                                                                        <div >
                                                                            Help
                                                                         </div>
                                                                         
                                                                    </div>  
                                                                </li>
                                                                <li className="cursor-pointer" onClick={()=>{userBrowserHistory.push('/feedback'); this.menuToggle();}} >  
                                                                    <div className="d-flex  flex-wrap align-content-center"> 
                                                                         <div className="me-4">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                                <path d="M14.7187 10.6562C14.7187 11.0154 14.5761 11.3598 14.3221 11.6138C14.0682 11.8677 13.7237 12.0104 13.3646 12.0104H5.23958L2.53125 14.7187V3.88542C2.53125 3.52627 2.67392 3.18183 2.92788 2.92788C3.18183 2.67392 3.52627 2.53125 3.88542 2.53125H13.3646C13.7237 2.53125 14.0682 2.67392 14.3221 2.92788C14.5761 3.18183 14.7187 3.52627 14.7187 3.88542V10.6562Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>
                                                                         </div>
                                                                        
                                                                        <div >
                                                                            Feedback
                                                                         </div>
                                                                         
                                                                    </div>  
                                                                </li>
                                                                <li className="cursor-pointer" onClick={this.navigateToLogout}>  
                                                                    <div className="d-flex  flex-wrap align-content-center"> 
                                                                        <div className="me-4">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                                <path d="M13.3646 7.94789H3.88542C3.13753 7.94789 2.53125 8.55417 2.53125 9.30206V14.0416C2.53125 14.7895 3.13753 15.3958 3.88542 15.3958H13.3646C14.1125 15.3958 14.7188 14.7895 14.7188 14.0416V9.30206C14.7188 8.55417 14.1125 7.94789 13.3646 7.94789Z" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                <path d="M5.23975 7.94789V5.23956C5.23975 4.34169 5.59642 3.4806 6.23131 2.84571C6.8662 2.21082 7.72729 1.85414 8.62516 1.85414C9.52303 1.85414 10.3841 2.21082 11.019 2.84571C11.6539 3.4806 12.0106 4.34169 12.0106 5.23956V7.94789" stroke="#23212A" strokeLinecap="round" strokeLinejoin="round"/>
                                                                            </svg>
                                                                        </div>
                                                                        
                                                                        <div >
                                                                            Logout
                                                                         </div>
                                                                         
                                                                    </div>  
                                                                </li>
                                                                <li className="close sideBarClosedButton" onClick={this.menuToggle}>X</li>
                                                            </ul>
                                                    <div className="nav-cart " onClick= {this.navigateToCart}>
                                                        
                                                        <div className="text-center">
                                                            <div className="cart-icon">
                                                                <div className="greenIcon"></div>
                                                                <span className="carvalue"> {cartList.length === 0?0:cartList?.length} </span>
                                                                <div className="vector">
                                                                <div className="vector2"></div>
                                                                </div>
                                                            </div>
                                                            {/* <img src={CartIcon} alt="" onClick= {this.navigateToCart} className="car-icon" /> */}
                                                        </div>
                                                    </div>
                                                </nav>
                                            </div>}
                                        {authenticate === null?
                                        <button type="button" className="btn btn-success buttonSuccess"
                                            style={{float:"right"}}
                                            onClick={this.navigateToVerification}
                                        >
                                            Sign In
                                        </button>:<div className="cursor-pointer">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="40" viewBox="0 0 42 40" fill="none" onClick={this.menuToggle}>
                                                            <rect width="42" height="40" rx="5" fill="#23212A"/>
                                                            <path d="M25.8401 20.065H15.3401" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M28.4651 16.7316H12.7151" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M28.4651 23.3983H12.7151" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>}
                            </div>
                        </div>
                    </div>
                </header>
            </div>
        )
    }
}

export default Header
