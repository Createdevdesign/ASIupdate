import React, { Component } from 'react';
import axios from 'axios';
import '../css/MenuItems.css';
import { DataContext } from '../Context';
import userBrowserHistory from '../History';
import '../css/Header.css';
import Loading from './loading';
import UnderLineTabs from './Inventory/underLineTabs';
import InventoryList from './Inventory/inventoryList';
import Tabs from "./Headers/tabs";
import StoreTimings from "./Store/storeTimings";
import InventoryDetail from "./Inventory/inventoryDetail2";
import CartList from "./cartForm/cartList";
import Scrollspy from 'react-scrollspy';

export class MenuItems extends Component {

    static contextType = DataContext;

    constructor() {
        super();
        this.state = {
            storeID: '',
            storeName: '',
            itemsList: [],
            categoryList: [],
            categoryArrayList:[],
            price: '',
            name: [],
            total: 0,
            quantity: 0,
            clickedFromRestaurant: false,
            storeImage:"",
            noCategoryData:[],
            yourPick: "Dine-in",
            menuItems:[],
            show:false,
            calenderTimings: [],
            selectedCalenderTiming:{length:0, value:""},
            storeServiceArray:[],
            showInventory:false,
            quantityValue:1,
            inventoryDetailData: {}
        };
        this.handleSelectedRadioButton = this.handleSelectedRadioButton.bind(this);
    }
    handleSelectedRadioButton = (name, value) => {
        this.setState({[name]:value})
    }
    handleRadio = (e) => {
        if(e.target.value === 'Pickup'){
            this.setState({menuItems:[], show: true, selectedCalenderTiming:{length:0, value:""}})
        }
        if(e.target.value === 'Delivery'){
            this.setState({menuItems:[{
                Menus:'Delivery',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:"",
                selectedDate: "",
                selectedTime: "",
            }], selectedCalenderTiming:{length:0, value:""}})
        }
        if(e.target.value==="Dine-in"){
            localStorage.removeItem('storeTimings');
            this.setState({menuItems:[{
                Menus:'Menu',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:"",
                selectedDate: "",
                selectedTime: "",
            },
            {
                Menus:'Catering',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:"",
                selectedDate: "",
                selectedTime: "",
            },
            {
                Menus:'Buffet',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:"",
                selectedDate: "",
                selectedTime: "",
            }], selectedCalenderTiming:{length:0, value:""}})
        }
        this.setState({ yourPick: e.target.value })
    }
    storeCalenderTimings = () => {
        const token = "Bearer "+ localStorage.getItem("sessionToken")
        axios.get(`/api/stores/v1/${localStorage.getItem("restaurentId")}/hours?type=pickup`, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : token, 'x-timezone':this.context.timeZone}})
            .then(res => {
                let finalData = []
                res.data.data.availableSchedule.forEach((element, i) => {
                    if(i<4){
                        finalData.push(element)
                    }
                    
                });
                this.setState({ calenderTimings : finalData})
                this.context.loadingFunction(false)
            })
            .catch(err => {
                this.context.loadingFunction(false)
                console.log("store list error", err)
                if(err.response?.data?.message === "jwt expired"){
                    let serviceType = "ANONYMOUS"
                    if(this.state.authenticate){
                      serviceType = "CUSTOMER"
                    }
                    this.context.commonRefreshToken(serviceType)
                  }
                console.log(err);
            });
    }
    inventoryList = (tempStoreId) => {
        
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get(`/api/inventory/v1/${tempStoreId}/products?page=1&limit=101`, { baseURL:this.context.baseURLNew, withCredentials:false,headers: { "authorization": "Bearer " + token } })
        .then(res => {
            let categoryArrayListData = []
            res.data.productCategories.filter(item=>categoryArrayListData.push(item.Name))
            var result = res.data.data.filter(o1=>{
                // filter out (!) items in result2
                
                return !res.data.productCategories.some(o2 => {
                    return o1.ProductCategories[0]?.CategoryId === o2["_id"];          // assumes unique id
                });
            })
            let serviceArray=['Dine-in']
            if(userBrowserHistory?.location?.state?.restaurantdetailProps?.isDeliveryEnabled){
                serviceArray.push("Delivery");
            }
            if(userBrowserHistory?.location?.state?.restaurantdetailProps?.isPickUpEnabled){
                serviceArray.push("Pickup");
            }
            this.setState({ itemsList: res.data.data, categoryArrayList:[...categoryArrayListData, "Others"], categoryList:[...res.data.productCategories, {_id:"", Name:"Others"}], noCategoryData: result, storeServiceArray:serviceArray  })
            this.context.loadingFunction(false)
        })
        .catch(err => {
            console.log("inventory list error", err)
            if(err.response?.data?.message === "jwt expired"){
                let serviceType = "ANONYMOUS"
                if(this.state.authenticate){
                  serviceType = "CUSTOMER"
                }
                this.context.commonRefreshToken(serviceType)
              }
            // if(this.context.authenticate){
            //     this.context.refreshTokenApi();
            //     }else{
            //     this.context.commonRefreshToken();
            //     }
        });
    }
    componentDidMount() {
        this.context.yellowBlurHiddenFunction(false);
        const data = this.props.location.state ? this.props.location.state.restaurantdetailProps : this.props.location.restaurantdetailProps;
        // const tempStoreId = this.props.match.params.id;
        const tempStoreId = this.props.location.state ? this.props.location.state.restaurantdetailProps?.restaurantID : this.props.location.restaurantdetailProps?.restaurantID;
        if(this.state.yourPick==="Dine-in"){
            this.setState({menuItems:[{
                Menus:'Menu',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:""
            },
            {
                Menus:'Catering',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:""
            },
            {
                Menus:'Buffet',
                timings:'11:00 AM – 12:00 AM',
                storeTimingsEdit:""
            }]})
        }
        if (data && data.isRestaurantOpen) {
            
            this.setState({ storeID: tempStoreId });
            this.setState({ storeName: data.restaurantName });
            this.setState({storeImage: data.restaurantImage})
            this.inventoryList(tempStoreId);
            this.storeCalenderTimings();
        }
        if (!data) {
            this.setState({ storeID: tempStoreId });
            this.setState({ storeName: this.context.storeName });
            this.inventoryList(tempStoreId);
            this.storeCalenderTimings();
        }
        this.context.getCartlength(tempStoreId);
    }
    stripHTML(text) {
        return text.replace(/<.*?>/gm, '');
    }

    navigateToCatergories = () => {
        userBrowserHistory.push('/restaurant/categories')
    }

    navigateToCartOrSignIn = () => {
        if(this.context.auth){
          this.context.addToCart();
        }else{
          userBrowserHistory.push('/stepVerification');
        }
    }

    setShow = (value) => {
        this.setState({show:value})
    }

    editPickUpStoreTimings = (value) => {
        let timings = this.state.calenderTimings
        let arraylength=0;
        timings.filter((item, i) =>{
            if(item.date === value.selectedDate){
                arraylength = i;
            }
            return arraylength;
        })
        this.setState({show:true, selectedCalenderTiming:{length:arraylength, value:value.selectedTime}})
    }

    inventoryDetail = (boolean, inventoryId) => {
        this.setState({showInventory:boolean})
        if(boolean === true){
            const token = localStorage.getItem("sessionToken");
            this.context.loadingFunction(true)
            axios.get(`/api/inventory/v1/${localStorage.getItem("restaurentId")}/products/${inventoryId}`, { baseURL:this.context.baseURLNew, withCredentials:false,headers: { "authorization": "Bearer " + token } })
                  .then(res => {
                    // this.setState({ storeData: res.data.data })
                    this.setState({ inventoryDetailData: res.data })
                    this.context.loadingFunction(false)
              })
                .catch(err => {
                    console.log("inventory detail error", err)
                    if(err.response?.data?.message === "jwt expired"){
                        let serviceType = "ANONYMOUS"
                        if(this.state.authenticate){
                          serviceType = "CUSTOMER"
                        }
                        this.context.commonRefreshToken(serviceType)
                    }
                    this.context.loadingFunction(false)
            });
        }
    }

    quantityIncreament = (name, value) => {
        if(name === "positive"){
          if(this.state.quantityValue < 10) {
            this.setState({quantityValue:value})
          }
        }
        if(name === "negative"){
          if(this.state.quantityValue > 1) {
            this.setState({quantityValue:value})
          }
        }
      }

      
    render() {
        localStorage.setItem("selectedServiceType",this.state.yourPick)
        return (
            
                <>
                    <Loading loading={this.context.loading}/>
                    
                    <div className="store-image" style={{ 
                            backgroundImage: `linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%), 
                            url(${localStorage.getItem("storeImage")})` 
                            }} >
                        <div className="bg-transition-data">
                            <div className="store-image-content mt-3 ff-poppins" >
                                <div className="row bg-none">
                                    <div className="col-md-6 col-lg-6 col-sm-6 bg-none">
                                        <span className="bg-none ff-righteous store-name-fit" >{localStorage.getItem("storeName")} </span>
                                    </div>
                                    <div className="col-md-2 col-lg-2 col-sm-0 bg-none">

                                    </div>
                                    <div className="col-md-4 col-lg-4 col-sm-6 d-flex justify-content-end bg-none zIndex" >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="me-4 bg-none cursor-pointer" width="123" height="35" viewBox="0 0 123 35" fill="none">
                                            <rect opacity="0.2" width="123" height="35" rx="5" fill="#F2F2F2"/>
                                            <path d="M47.26 15.06C47.028 14.572 46.692 14.196 46.252 13.932C45.812 13.66 45.3 13.524 44.716 13.524C44.132 13.524 43.604 13.66 43.132 13.932C42.668 14.196 42.3 14.58 42.028 15.084C41.764 15.58 41.632 16.156 41.632 16.812C41.632 17.468 41.764 18.044 42.028 18.54C42.3 19.036 42.668 19.42 43.132 19.692C43.604 19.956 44.132 20.088 44.716 20.088C45.532 20.088 46.204 19.844 46.732 19.356C47.26 18.868 47.568 18.208 47.656 17.376H44.32V16.488H48.82V17.328C48.756 18.016 48.54 18.648 48.172 19.224C47.804 19.792 47.32 20.244 46.72 20.58C46.12 20.908 45.452 21.072 44.716 21.072C43.94 21.072 43.232 20.892 42.592 20.532C41.952 20.164 41.444 19.656 41.068 19.008C40.7 18.36 40.516 17.628 40.516 16.812C40.516 15.996 40.7 15.264 41.068 14.616C41.444 13.96 41.952 13.452 42.592 13.092C43.232 12.724 43.94 12.54 44.716 12.54C45.604 12.54 46.388 12.76 47.068 13.2C47.756 13.64 48.256 14.26 48.568 15.06H47.26ZM51.3558 15.492C51.5478 15.116 51.8198 14.824 52.1718 14.616C52.5318 14.408 52.9678 14.304 53.4798 14.304V15.432H53.1918C51.9678 15.432 51.3558 16.096 51.3558 17.424V21H50.2638V14.424H51.3558V15.492ZM57.6084 21.108C56.9924 21.108 56.4324 20.968 55.9284 20.688C55.4324 20.408 55.0404 20.012 54.7524 19.5C54.4724 18.98 54.3324 18.38 54.3324 17.7C54.3324 17.028 54.4764 16.436 54.7644 15.924C55.0604 15.404 55.4604 15.008 55.9644 14.736C56.4684 14.456 57.0324 14.316 57.6564 14.316C58.2804 14.316 58.8444 14.456 59.3484 14.736C59.8524 15.008 60.2484 15.4 60.5364 15.912C60.8324 16.424 60.9804 17.02 60.9804 17.7C60.9804 18.38 60.8284 18.98 60.5244 19.5C60.2284 20.012 59.8244 20.408 59.3124 20.688C58.8004 20.968 58.2324 21.108 57.6084 21.108ZM57.6084 20.148C58.0004 20.148 58.3684 20.056 58.7124 19.872C59.0564 19.688 59.3324 19.412 59.5404 19.044C59.7564 18.676 59.8644 18.228 59.8644 17.7C59.8644 17.172 59.7604 16.724 59.5524 16.356C59.3444 15.988 59.0724 15.716 58.7364 15.54C58.4004 15.356 58.0364 15.264 57.6444 15.264C57.2444 15.264 56.8764 15.356 56.5404 15.54C56.2124 15.716 55.9484 15.988 55.7484 16.356C55.5484 16.724 55.4484 17.172 55.4484 17.7C55.4484 18.236 55.5444 18.688 55.7364 19.056C55.9364 19.424 56.2004 19.7 56.5284 19.884C56.8564 20.06 57.2164 20.148 57.6084 20.148ZM68.2482 14.424V21H67.1562V20.028C66.9482 20.364 66.6562 20.628 66.2802 20.82C65.9122 21.004 65.5042 21.096 65.0562 21.096C64.5442 21.096 64.0842 20.992 63.6762 20.784C63.2682 20.568 62.9442 20.248 62.7042 19.824C62.4722 19.4 62.3562 18.884 62.3562 18.276V14.424H63.4362V18.132C63.4362 18.78 63.6002 19.28 63.9282 19.632C64.2562 19.976 64.7042 20.148 65.2722 20.148C65.8562 20.148 66.3162 19.968 66.6522 19.608C66.9882 19.248 67.1562 18.724 67.1562 18.036V14.424H68.2482ZM71.184 15.636C71.4 15.26 71.72 14.948 72.144 14.7C72.576 14.444 73.076 14.316 73.644 14.316C74.228 14.316 74.756 14.456 75.228 14.736C75.708 15.016 76.084 15.412 76.356 15.924C76.628 16.428 76.764 17.016 76.764 17.688C76.764 18.352 76.628 18.944 76.356 19.464C76.084 19.984 75.708 20.388 75.228 20.676C74.756 20.964 74.228 21.108 73.644 21.108C73.084 21.108 72.588 20.984 72.156 20.736C71.732 20.48 71.408 20.164 71.184 19.788V24.12H70.092V14.424H71.184V15.636ZM75.648 17.688C75.648 17.192 75.548 16.76 75.348 16.392C75.148 16.024 74.876 15.744 74.532 15.552C74.196 15.36 73.824 15.264 73.416 15.264C73.016 15.264 72.644 15.364 72.3 15.564C71.964 15.756 71.692 16.04 71.484 16.416C71.284 16.784 71.184 17.212 71.184 17.7C71.184 18.196 71.284 18.632 71.484 19.008C71.692 19.376 71.964 19.66 72.3 19.86C72.644 20.052 73.016 20.148 73.416 20.148C73.824 20.148 74.196 20.052 74.532 19.86C74.876 19.66 75.148 19.376 75.348 19.008C75.548 18.632 75.648 18.192 75.648 17.688ZM85.1926 21.084C84.4166 21.084 83.7086 20.904 83.0686 20.544C82.4286 20.176 81.9206 19.668 81.5446 19.02C81.1766 18.364 80.9926 17.628 80.9926 16.812C80.9926 15.996 81.1766 15.264 81.5446 14.616C81.9206 13.96 82.4286 13.452 83.0686 13.092C83.7086 12.724 84.4166 12.54 85.1926 12.54C85.9766 12.54 86.6886 12.724 87.3286 13.092C87.9686 13.452 88.4726 13.956 88.8406 14.604C89.2086 15.252 89.3926 15.988 89.3926 16.812C89.3926 17.636 89.2086 18.372 88.8406 19.02C88.4726 19.668 87.9686 20.176 87.3286 20.544C86.6886 20.904 85.9766 21.084 85.1926 21.084ZM85.1926 20.136C85.7766 20.136 86.3006 20 86.7646 19.728C87.2366 19.456 87.6046 19.068 87.8686 18.564C88.1406 18.06 88.2766 17.476 88.2766 16.812C88.2766 16.14 88.1406 15.556 87.8686 15.06C87.6046 14.556 87.2406 14.168 86.7766 13.896C86.3126 13.624 85.7846 13.488 85.1926 13.488C84.6006 13.488 84.0726 13.624 83.6086 13.896C83.1446 14.168 82.7766 14.556 82.5046 15.06C82.2406 15.556 82.1086 16.14 82.1086 16.812C82.1086 17.476 82.2406 18.06 82.5046 18.564C82.7766 19.068 83.1446 19.456 83.6086 19.728C84.0806 20 84.6086 20.136 85.1926 20.136ZM91.9262 15.492C92.1182 15.116 92.3902 14.824 92.7422 14.616C93.1022 14.408 93.5382 14.304 94.0502 14.304V15.432H93.7622C92.5382 15.432 91.9262 16.096 91.9262 17.424V21H90.8342V14.424H91.9262V15.492ZM94.9027 17.688C94.9027 17.016 95.0387 16.428 95.3107 15.924C95.5827 15.412 95.9547 15.016 96.4267 14.736C96.9067 14.456 97.4427 14.316 98.0347 14.316C98.5467 14.316 99.0227 14.436 99.4627 14.676C99.9027 14.908 100.239 15.216 100.471 15.6V12.12H101.575V21H100.471V19.764C100.255 20.156 99.9347 20.48 99.5107 20.736C99.0867 20.984 98.5907 21.108 98.0227 21.108C97.4387 21.108 96.9067 20.964 96.4267 20.676C95.9547 20.388 95.5827 19.984 95.3107 19.464C95.0387 18.944 94.9027 18.352 94.9027 17.688ZM100.471 17.7C100.471 17.204 100.371 16.772 100.171 16.404C99.9707 16.036 99.6987 15.756 99.3547 15.564C99.0187 15.364 98.6467 15.264 98.2387 15.264C97.8307 15.264 97.4587 15.36 97.1227 15.552C96.7867 15.744 96.5187 16.024 96.3187 16.392C96.1187 16.76 96.0187 17.192 96.0187 17.688C96.0187 18.192 96.1187 18.632 96.3187 19.008C96.5187 19.376 96.7867 19.66 97.1227 19.86C97.4587 20.052 97.8307 20.148 98.2387 20.148C98.6467 20.148 99.0187 20.052 99.3547 19.86C99.6987 19.66 99.9707 19.376 100.171 19.008C100.371 18.632 100.471 18.196 100.471 17.7ZM109.42 17.46C109.42 17.668 109.408 17.888 109.384 18.12H104.128C104.168 18.768 104.388 19.276 104.788 19.644C105.196 20.004 105.688 20.184 106.264 20.184C106.736 20.184 107.128 20.076 107.44 19.86C107.76 19.636 107.984 19.34 108.112 18.972H109.288C109.112 19.604 108.76 20.12 108.232 20.52C107.704 20.912 107.048 21.108 106.264 21.108C105.64 21.108 105.08 20.968 104.584 20.688C104.096 20.408 103.712 20.012 103.432 19.5C103.152 18.98 103.012 18.38 103.012 17.7C103.012 17.02 103.148 16.424 103.42 15.912C103.692 15.4 104.072 15.008 104.56 14.736C105.056 14.456 105.624 14.316 106.264 14.316C106.888 14.316 107.44 14.452 107.92 14.724C108.4 14.996 108.768 15.372 109.024 15.852C109.288 16.324 109.42 16.86 109.42 17.46ZM108.292 17.232C108.292 16.816 108.2 16.46 108.016 16.164C107.832 15.86 107.58 15.632 107.26 15.48C106.948 15.32 106.6 15.24 106.216 15.24C105.664 15.24 105.192 15.416 104.8 15.768C104.416 16.12 104.196 16.608 104.14 17.232H108.292ZM111.954 15.492C112.146 15.116 112.418 14.824 112.77 14.616C113.13 14.408 113.566 14.304 114.078 14.304V15.432H113.79C112.566 15.432 111.954 16.096 111.954 17.424V21H110.862V14.424H111.954V15.492Z" fill="white"/>
                                            <path d="M25 26V24C25 22.9391 24.5786 21.9217 23.8284 21.1716C23.0783 20.4214 22.0609 20 21 20H14C12.9391 20 11.9217 20.4214 11.1716 21.1716C10.4214 21.9217 10 22.9391 10 24V26" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M17.5 16C19.7091 16 21.5 14.2091 21.5 12C21.5 9.79086 19.7091 8 17.5 8C15.2909 8 13.5 9.79086 13.5 12C13.5 14.2091 15.2909 16 17.5 16Z" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M29 13V19" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M32 16H26" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='cursor-pointer bg-none zIndex me-4' width="100" height="35" viewBox="0 0 100 35" fill="none">
                                            <rect opacity="0.2" width="100" height="35" rx="5" fill="#F2F2F2"/>
                                            <path d="M23.8333 10.3333H12.1667C11.2462 10.3333 10.5 11.0794 10.5 11.9999V23.6666C10.5 24.5871 11.2462 25.3333 12.1667 25.3333H23.8333C24.7538 25.3333 25.5 24.5871 25.5 23.6666V11.9999C25.5 11.0794 24.7538 10.3333 23.8333 10.3333Z" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M21.3334 8.66675V12.0001" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M14.6666 8.66675V12.0001" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M10.5 15.3333H25.5" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M40.576 21.084C40.024 21.084 39.528 20.988 39.088 20.796C38.656 20.596 38.316 20.324 38.068 19.98C37.82 19.628 37.692 19.224 37.684 18.768H38.848C38.888 19.16 39.048 19.492 39.328 19.764C39.616 20.028 40.032 20.16 40.576 20.16C41.096 20.16 41.504 20.032 41.8 19.776C42.104 19.512 42.256 19.176 42.256 18.768C42.256 18.448 42.168 18.188 41.992 17.988C41.816 17.788 41.596 17.636 41.332 17.532C41.068 17.428 40.712 17.316 40.264 17.196C39.712 17.052 39.268 16.908 38.932 16.764C38.604 16.62 38.32 16.396 38.08 16.092C37.848 15.78 37.732 15.364 37.732 14.844C37.732 14.388 37.848 13.984 38.08 13.632C38.312 13.28 38.636 13.008 39.052 12.816C39.476 12.624 39.96 12.528 40.504 12.528C41.288 12.528 41.928 12.724 42.424 13.116C42.928 13.508 43.212 14.028 43.276 14.676H42.076C42.036 14.356 41.868 14.076 41.572 13.836C41.276 13.588 40.884 13.464 40.396 13.464C39.94 13.464 39.568 13.584 39.28 13.824C38.992 14.056 38.848 14.384 38.848 14.808C38.848 15.112 38.932 15.36 39.1 15.552C39.276 15.744 39.488 15.892 39.736 15.996C39.992 16.092 40.348 16.204 40.804 16.332C41.356 16.484 41.8 16.636 42.136 16.788C42.472 16.932 42.76 17.16 43 17.472C43.24 17.776 43.36 18.192 43.36 18.72C43.36 19.128 43.252 19.512 43.036 19.872C42.82 20.232 42.5 20.524 42.076 20.748C41.652 20.972 41.152 21.084 40.576 21.084ZM44.559 17.7C44.559 17.02 44.695 16.428 44.967 15.924C45.239 15.412 45.615 15.016 46.095 14.736C46.583 14.456 47.139 14.316 47.763 14.316C48.571 14.316 49.235 14.512 49.755 14.904C50.283 15.296 50.631 15.84 50.799 16.536H49.623C49.511 16.136 49.291 15.82 48.963 15.588C48.643 15.356 48.243 15.24 47.763 15.24C47.139 15.24 46.635 15.456 46.251 15.888C45.867 16.312 45.675 16.916 45.675 17.7C45.675 18.492 45.867 19.104 46.251 19.536C46.635 19.968 47.139 20.184 47.763 20.184C48.243 20.184 48.643 20.072 48.963 19.848C49.283 19.624 49.503 19.304 49.623 18.888H50.799C50.623 19.56 50.271 20.1 49.743 20.508C49.215 20.908 48.555 21.108 47.763 21.108C47.139 21.108 46.583 20.968 46.095 20.688C45.615 20.408 45.239 20.012 44.967 19.5C44.695 18.988 44.559 18.388 44.559 17.7ZM55.52 14.304C56.016 14.304 56.464 14.412 56.864 14.628C57.264 14.836 57.576 15.152 57.8 15.576C58.032 16 58.148 16.516 58.148 17.124V21H57.068V17.28C57.068 16.624 56.904 16.124 56.576 15.78C56.248 15.428 55.8 15.252 55.232 15.252C54.656 15.252 54.196 15.432 53.852 15.792C53.516 16.152 53.348 16.676 53.348 17.364V21H52.256V12.12H53.348V15.36C53.564 15.024 53.86 14.764 54.236 14.58C54.62 14.396 55.048 14.304 55.52 14.304ZM65.9318 17.46C65.9318 17.668 65.9198 17.888 65.8958 18.12H60.6398C60.6798 18.768 60.8998 19.276 61.2998 19.644C61.7078 20.004 62.1998 20.184 62.7758 20.184C63.2478 20.184 63.6398 20.076 63.9518 19.86C64.2718 19.636 64.4958 19.34 64.6238 18.972H65.7998C65.6238 19.604 65.2718 20.12 64.7438 20.52C64.2158 20.912 63.5598 21.108 62.7758 21.108C62.1518 21.108 61.5918 20.968 61.0958 20.688C60.6078 20.408 60.2238 20.012 59.9438 19.5C59.6638 18.98 59.5238 18.38 59.5238 17.7C59.5238 17.02 59.6598 16.424 59.9318 15.912C60.2038 15.4 60.5838 15.008 61.0718 14.736C61.5678 14.456 62.1358 14.316 62.7758 14.316C63.3998 14.316 63.9518 14.452 64.4318 14.724C64.9118 14.996 65.2798 15.372 65.5358 15.852C65.7998 16.324 65.9318 16.86 65.9318 17.46ZM64.8038 17.232C64.8038 16.816 64.7118 16.46 64.5278 16.164C64.3438 15.86 64.0918 15.632 63.7718 15.48C63.4598 15.32 63.1118 15.24 62.7278 15.24C62.1758 15.24 61.7038 15.416 61.3118 15.768C60.9278 16.12 60.7078 16.608 60.6518 17.232H64.8038ZM66.9652 17.688C66.9652 17.016 67.1012 16.428 67.3732 15.924C67.6452 15.412 68.0172 15.016 68.4892 14.736C68.9692 14.456 69.5052 14.316 70.0972 14.316C70.6092 14.316 71.0852 14.436 71.5252 14.676C71.9652 14.908 72.3012 15.216 72.5332 15.6V12.12H73.6372V21H72.5332V19.764C72.3172 20.156 71.9972 20.48 71.5732 20.736C71.1492 20.984 70.6532 21.108 70.0852 21.108C69.5012 21.108 68.9692 20.964 68.4892 20.676C68.0172 20.388 67.6452 19.984 67.3732 19.464C67.1012 18.944 66.9652 18.352 66.9652 17.688ZM72.5332 17.7C72.5332 17.204 72.4332 16.772 72.2332 16.404C72.0332 16.036 71.7612 15.756 71.4172 15.564C71.0812 15.364 70.7092 15.264 70.3012 15.264C69.8932 15.264 69.5212 15.36 69.1852 15.552C68.8492 15.744 68.5812 16.024 68.3812 16.392C68.1812 16.76 68.0812 17.192 68.0812 17.688C68.0812 18.192 68.1812 18.632 68.3812 19.008C68.5812 19.376 68.8492 19.66 69.1852 19.86C69.5212 20.052 69.8932 20.148 70.3012 20.148C70.7092 20.148 71.0812 20.052 71.4172 19.86C71.7612 19.66 72.0332 19.376 72.2332 19.008C72.4332 18.632 72.5332 18.196 72.5332 17.7ZM81.3146 14.424V21H80.2226V20.028C80.0146 20.364 79.7226 20.628 79.3466 20.82C78.9786 21.004 78.5706 21.096 78.1226 21.096C77.6106 21.096 77.1506 20.992 76.7426 20.784C76.3346 20.568 76.0106 20.248 75.7706 19.824C75.5386 19.4 75.4226 18.884 75.4226 18.276V14.424H76.5026V18.132C76.5026 18.78 76.6666 19.28 76.9946 19.632C77.3226 19.976 77.7706 20.148 78.3386 20.148C78.9226 20.148 79.3826 19.968 79.7186 19.608C80.0546 19.248 80.2226 18.724 80.2226 18.036V14.424H81.3146ZM84.2504 12.12V21H83.1584V12.12H84.2504ZM92.1115 17.46C92.1115 17.668 92.0995 17.888 92.0755 18.12H86.8195C86.8595 18.768 87.0795 19.276 87.4795 19.644C87.8875 20.004 88.3795 20.184 88.9555 20.184C89.4275 20.184 89.8195 20.076 90.1315 19.86C90.4515 19.636 90.6755 19.34 90.8035 18.972H91.9795C91.8035 19.604 91.4515 20.12 90.9235 20.52C90.3955 20.912 89.7395 21.108 88.9555 21.108C88.3315 21.108 87.7715 20.968 87.2755 20.688C86.7875 20.408 86.4035 20.012 86.1235 19.5C85.8435 18.98 85.7035 18.38 85.7035 17.7C85.7035 17.02 85.8395 16.424 86.1115 15.912C86.3835 15.4 86.7635 15.008 87.2515 14.736C87.7475 14.456 88.3155 14.316 88.9555 14.316C89.5795 14.316 90.1315 14.452 90.6115 14.724C91.0915 14.996 91.4595 15.372 91.7155 15.852C91.9795 16.324 92.1115 16.86 92.1115 17.46ZM90.9835 17.232C90.9835 16.816 90.8915 16.46 90.7075 16.164C90.5235 15.86 90.2715 15.632 89.9515 15.48C89.6395 15.32 89.2915 15.24 88.9075 15.24C88.3555 15.24 87.8835 15.416 87.4915 15.768C87.1075 16.12 86.8875 16.608 86.8315 17.232H90.9835Z" fill="white"/>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='cursor-pointer bg-none zIndex' width="35" height="35" viewBox="0 0 35 35" fill="none">
                                            <rect opacity="0.2" width="35" height="35" rx="5" fill="#F2F2F2"/>
                                            <path d="M25.3667 10.8417C24.9411 10.4159 24.4357 10.0781 23.8795 9.84763C23.3233 9.61716 22.7271 9.49854 22.1251 9.49854C21.523 9.49854 20.9268 9.61716 20.3706 9.84763C19.8144 10.0781 19.309 10.4159 18.8834 10.8417L18.0001 11.7251L17.1167 10.8417C16.257 9.98198 15.0909 9.49898 13.8751 9.49898C12.6592 9.49898 11.4931 9.98198 10.6334 10.8417C9.77365 11.7015 9.29065 12.8675 9.29065 14.0834C9.29065 15.2993 9.77365 16.4653 10.6334 17.3251L11.5167 18.2084L18.0001 24.6917L24.4834 18.2084L25.3667 17.3251C25.7926 16.8994 26.1304 16.3941 26.3608 15.8379C26.5913 15.2816 26.7099 14.6855 26.7099 14.0834C26.7099 13.4813 26.5913 12.8851 26.3608 12.3289C26.1304 11.7727 25.7926 11.2674 25.3667 10.8417V10.8417Z" stroke="white" strokeWidth={"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                                {/* <div className="row bg-none mt-4 h-25">
                                    <div className="col-md-12 bg-none three-dots" style={{ fontSize:"12px", color:"#FFFFFF", textAlign:"justify", WebkitLineClamp:"2", fontWeight:"200" }}>
                                        If you're wondering what's popular here, it might be helpful to know that of the 119 things on the menu, the Turkey Breast Footlong Regular Sub is one of the most ordered and the Spicy Italian Footlong Regular Sub and the Sweet Onion Chicken Teriyaki Footlong Regular Sub are two of the items most commonly ordered together at this earlyIf you're wondering what's popular here, it might be helpful to know that of the 119 things on the menu, the Turkey Breast Footlong Regular Sub is one of the most ordered and the Spicy Italian Footlong Regular Sub and the Sweet Onion Chicken Teriyaki Footlong Regular Sub are two of the items most commonly ordered together at this early
                                    </div>
                                </div> */}
                                <div className="row bg-none mt-2">
                                    <div className="col-md-12 bg-none" style={{ fontSize:"12px", color:"#FFFFFF", textAlign:"justify", fontWeight:"bold" }}>
                                        {localStorage.getItem("storeAddress")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <StoreTimings show={this.state.show} setShow={this.setShow} handleSelectedRadioButton={this.handleSelectedRadioButton} calenderTimings={this.state.calenderTimings} editStoreTimings={this.editPickUpStoreTimings} selectedCalenderTiming={this.state.selectedCalenderTiming} />
                    <div id="menuItems" className="container menuItems" >
                        <div className="row">
                        <div className="pickUpHeader mb-2">
                                <div className="row">
                                    <div className="col-sm-12">
                                    
                                        <div className="headerTabs" style={{border: "1px solid #F2F2F2", display:"inline-block", float: "right", backgroundColor:"none"}}>
                                            <div className="" style={{border: "1px solid #F2F2F2", display:"flex", float: "right"}}>
                                                <Tabs handleSelected={this.handleRadio} arrayData={/*[ 'Dine-in','Pickup','Delivery']*/this.state.storeServiceArray} selectedValue={this.state.yourPick} />
                                            </div>
                                        </div>
                                        <div className="menuit-name" style={{position:"unset"}}>
                                            <UnderLineTabs tabsArray={this.state.menuItems} setShow={this.setShow}
                                            />
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <div className='horizontalTabs' >
                            <Scrollspy items={ this.state.categoryArrayList } currentClassName="is-current" className='scrollCss' style={{ paddingLeft:"0px", marginBottom:"10px", overflow:"auto", whiteSpace:"nowrap" }}>
                                {this.state.categoryArrayList.map((item, i) => {
                                                        return (<a href={"#"+item} key={i}>{item}</a>)})
                                }
                            </Scrollspy>
                        </div>
                            
                        <div className={this.context.cartList.length === 0 && this.state.showInventory === false ?"col-sm-12":"col-sm-8"}>
                            
                            <InventoryList itemsList={this.state.itemsList } categoryArrayList={this.state.categoryArrayList} categoryList={this.state.categoryList} props={this.props} state={this.state} navigateToCatergories={this.navigateToCatergories} noCategoryData={this.state.noCategoryData} key={0} gridColumns={this.state.showInventory} inventoryDetail={this.inventoryDetail} />
                        </div>
                        {this.state.showInventory === false /*&& this.context.cartList.length !== 0*/?null:
                            <div className={this.state.showInventory === false && this.context.cartList.length !== 0?"":"col-sm-4"} style={{padding:"0px"}} >
                                    {/* InventoryDetail */}
                                    <InventoryDetail inventoryShow={false} inventorySetShow={this.inventoryDetail} inventoryDetailData={this.state.inventoryDetailData} context={this.context} />
                            </div>
                        }
                        {/*this.context.cartList.length === 0 &&*/ this.state.showInventory === true?null:
                            <div className={this.context.cartList.length === 0?"":"cartListCss col-sm-4"}>
                                <CartList  context = {this.context}/>
                                
                            </div>
                        }
                            
                        </div>
                    </div>
                </>
        )
    }
}

export default MenuItems