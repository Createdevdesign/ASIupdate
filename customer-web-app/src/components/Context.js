import React, { Component } from 'react';
import axios from 'axios';
import { v1 as uuidv1 } from 'uuid';

axios.defaults.withCredentials = true;
let uuidData = uuidv1()
export const DataContext = React.createContext();


export class DataProvider extends Component {
      state = {
          restaurantsList: [],
            cartList: [],
            total: 0,
            isResponseReceived : true,
            responseSuccess: false,
            authenticate:localStorage.getItem('auth'),
            timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,
            storeName:"",
            sessionToken:localStorage.getItem("sessionToken"),
            restaurentId: localStorage.getItem("restaurentId"),
            loading:false,
            // success and error message alert functionality
            message:"",
            styleList:"",
            alertDisplay:false,
            yellowBlur:true,
            baseURL: process.env.NODE_ENV === "development"? process.env.REACT_APP_API_ENDPOINT : process.env.REACT_APP_API_ENDPOINT,
            baseURLNew: process.env.NODE_ENV === "development"? process.env.REACT_APP_API_ENDPOINT_NEW: process.env.REACT_APP_API_ENDPOINT_NEW,
            baseUrlWebApi: process.env.REACT_APP_UI_API_ENDPOINT,
            cardList:[],
            cartTotalAmount:0,
            verifyNetwork:false
        };

    addToCart = (body, storeId, history) =>{
          const token = localStorage.getItem("sessionToken");
          axios.post('/api/carts/v1/me/'+storeId, body,
            {baseURL:this.state.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer " + token}
            }).then(res => {
              console.log("res", res)
              this.getCartlength(storeId);
              // history.push('/cart', {storeId:storeId, restaurantdetailProps:history.location.state?.restaurantdetailProps})
            })
            .catch(err => {
              console.log("add to cart error", err)
              if(err.response?.data?.message === "jwt expired"){
                let serviceType = "ANONYMOUS"
                if(this.state.authenticate){
                  serviceType = "CUSTOMER"
                }
                this.commonRefreshToken(serviceType)
              }
              this.loadingFunction(false)
              console.log(err);
            });
      };

      getCartlength = (storeId) => {
        const token = localStorage.getItem("sessionToken")
        this.loadingFunction(true)
        axios.get('/api/carts/v1/me/'+storeId, {baseURL:this.state.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
            this.setState({ cartList : res.data.shoppingCartItems, cartTotalAmount:res.data.totalCartPrice});
            this.loadingFunction(false)
          })
          .catch(err => {
            console.log("get cart list error", err)
            if(err.response?.data?.message === "jwt expired"){
              let serviceType = "ANONYMOUS"
              if(this.state.authenticate){
                serviceType = "CUSTOMER"
              }
              this.commonRefreshToken(serviceType)
            }
            this.loadingFunction(false)
            console.log(err);
          });
      }

      getCartDetails = () => {
        const token = localStorage.getItem("sessionToken")
        axios.get('/carts/v1/me/5ffce6219bf28304b09046a6', {baseURL:this.state.baseURL, withCredentials:false,headers : {"authorization" : token}})
          .then(res => {
            console.log(res);
          })
      }
      anonymousLogin = (devieId, timeZone) => {
        axios.post(this.state.baseUrlWebApi+"/api/ui/anonymous/login", { withCredentials: true }, {headers : {
              "x-device-id" : devieId,
              "x-timezone" : timeZone
            }
          })
          .then(res => {
            localStorage.setItem("sessionToken",res.data.access_token)
            this.storesList(res.data.access_token)
          })
          .catch(err => {
            console.log("anonymous login error", err)
            if(err.response?.data?.message === "jwt expired"){
              let serviceType = "ANONYMOUS"
              if(this.state.authenticate){
                serviceType = "CUSTOMER"
              }
              this.commonRefreshToken(serviceType)
            }
            this.loadingFunction(false)
            console.log(err);
          });
      }

    storesList = (token) => {
        axios.get('/api/stores/v1?page=1&limit=12',{baseURL:this.state.baseURLNew, withCredentials:false, headers : {
          "authorization" : "Bearer " + token,
          "apptype":"customer"
        }})
        .then(res => {
          this.setState({ restaurantsList : res.data.data})
          this.loadingFunction(false)
        })
        .catch(err => {
          console.log("store list error", err)
          if(err.response?.data?.message === "jwt expired"){
            let serviceType = "ANONYMOUS"
            if(this.state.authenticate){
              serviceType = "CUSTOMER"
            }
            this.commonRefreshToken(serviceType)
          }
          this.loadingFunction(false)
        });
    }
    refreshTokenApi = () => {
      const token = localStorage.getItem("sessionToken")
      let deviceId = localStorage.getItem('X-SS-DEVICE-ID')
      axios.post(this.state.baseUrlWebApi + '/api/ui/refresh', { withCredentials: true},{ headers:{
        token:token,
        'x-device-id': deviceId,
        'x-timezone': this.state.timeZone
      } })
      .then(res => {
        localStorage.setItem("sessionToken",res.data.access_token)
        this.storesList(res.data.access_token);
      })
      .catch(err => {
        console.log("refresh token error", err)
        
        localStorage.removeItem('auth')
        localStorage.removeItem('X-SS-DEVICE-ID')
        localStorage.removeItem('sessionToken')
        localStorage.removeItem('storeTimings')
        localStorage.removeItem('storeImage')
        localStorage.removeItem("selectedServiceType")
        this.responsedKey()
        this.anonymousLogin(deviceId, this.state.timeZone)
        // this.setState({ responseSuccess : true})
      });
    }

    commonRefreshToken = (serviceType) => {
      console.log("customer refresh token", serviceType)
      const token = localStorage.getItem("sessionToken")
      let deviceId = localStorage.getItem('X-SS-DEVICE-ID')
      axios.get(this.state.baseUrlWebApi+"/api/ui/refresh-token", { withCredentials: true, headers:{
        token:token,
        'x-device-id': deviceId,
        'x-timezone': this.state.timeZone,
        'service-type': serviceType
      } })
      .then(res => {
        localStorage.setItem("sessionToken",res.data.access_token)
        this.storesList(res.data.access_token);
      })
      .catch(err => {
        console.log("common refresh token err", err)
        if(this.state.authenticate){
          localStorage.removeItem('auth')
          localStorage.removeItem('X-SS-DEVICE-ID')
          localStorage.removeItem('sessionToken')
          localStorage.removeItem('storeTimings')
          localStorage.removeItem('storeImage')
          localStorage.removeItem("selectedServiceType")
          this.responsedKey()
        }
        this.anonymousLogin(deviceId, this.state.timeZone)
            // this.setState({ responseSuccess : true})
      });
    }
    componentDidMount(){
    // componentWillMount(){
        let deviceId = localStorage.getItem('X-SS-DEVICE-ID')
        if(!deviceId){
          localStorage.setItem('X-SS-DEVICE-ID',uuidData)
        }
        this.loadingFunction(true)
        let serviceType = "ANONYMOUS"
        if(this.state.authenticate){
          serviceType = "CUSTOMER"
        }
        this.commonRefreshToken(serviceType)
        // if(this.state.authenticate){
        //   this.refreshTokenApi();
        // }else{
        //   this.commonRefreshToken("ANONYMOUS");
        // }
    }
    responsedKey = () => {
      this.setState({ authenticate : localStorage.getItem('auth')})
    }
    loadingFunction = (boolean) => {
      this.setState({ loading : boolean})
    }
    storeNameFunction = (store) => {
      this.setState({ storeName : store})
    }
    
    errorHandlingFunction = (display, styleList, message) => {
      this.setState({ message:message,styleList:styleList,alertDisplay:display});
      setTimeout(() => {
        this.setState({ message:"",styleList:"",alertDisplay:false})
      }, 2000);
    }

    
    yellowBlurHiddenFunction = (hiddenData) => {
      this.setState({ yellowBlur : hiddenData})
    }
    getCustomerCardList = () => {
      const token = localStorage.getItem("sessionToken")
      axios.get('/api/payments/v1/payment-methods',{baseURL:this.state.baseURLNew, withCredentials:false, headers : {
        authorization:"Bearer " + token
      } })
      .then(res => {
        console.log("res", res)
        this.setState({cardList:res.data.data})
        this.errorHandlingFunction(true, "alert-success", "Card List");
      })
      .catch(err => {
        console.log("customer card list error", err.response)
        if(err.response?.data?.message === "jwt expired"){
          let serviceType = "ANONYMOUS"
          if(this.state.authenticate){
            serviceType = "CUSTOMER"
          }
          this.commonRefreshToken(serviceType)
        }
        this.errorHandlingFunction(true, "alert-danger", err.response?.data?.Message + "("+err.response?.status+")");
           // this.setState({ responseSuccess : true})
      });
    }
    attachCard = (paymentMethodId) => {
      const token = localStorage.getItem("sessionToken")
      axios.post('/api/payments/v1/payment-methods/'+paymentMethodId,{},{baseURL:this.state.baseURLNew, withCredentials:false, headers : {
        authorization:"Bearer " + token,
      } })
      .then(res => {
        this.errorHandlingFunction(true, "alert-success", "Card Added");
        this.getCustomerCardList();
      })
      .catch(err => {
        console.log("attach card error", err)
        if(err.response?.data?.message === "jwt expired"){
          let serviceType = "ANONYMOUS"
          if(this.state.authenticate){
            serviceType = "CUSTOMER"
          }
          this.commonRefreshToken(serviceType)
        }
        console.log("err", err.response)
        this.errorHandlingFunction(true, "alert-danger", err.response?.data?.Message + "("+err.response?.status+")");
           // this.setState({ responseSuccess : true})
      });
    }
    

    deleteCartitem = (storeId, cartId) => {
      const token = localStorage.getItem("sessionToken")
      this.loadingFunction(true)
      axios.delete('/api/carts/v1/me/'+storeId+'/item/'+cartId, {baseURL:this.state.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
        .then(res => {
          console.log("res", res)
          this.getCartlength(storeId);
          // this.setState({ cartList : res.data.shoppingCartItems, cartTotalAmount:res.data.totalCartPrice});
          // this.loadingFunction(false)
        })
        .catch(err => {
          console.log("delete card item", err)
          if(err.response?.data?.message === "jwt expired"){
            let serviceType = "ANONYMOUS"
            if(this.state.authenticate){
              serviceType = "CUSTOMER"
            }
            this.commonRefreshToken(serviceType)
          }
          this.loadingFunction(false)
          console.log(err);
        });
    }
    render() {
         const {restaurantsList , cartList, total, responseSuccess, authenticate, timeZone, storeName, sessionToken, restaurentId, loading, message,
         styleList,
         alertDisplay, yellowBlur, baseUrlWebApi, baseURL, baseURLNew, cardList, cartTotalAmount, verifyNetwork} = this.state;
         const {addToCart, getCartlength, getCartDetails, responsedKey, storesList, commonRefreshToken, refreshTokenApi, storeNameFunction, loadingFunction, errorHandlingFunction, yellowBlurHiddenFunction, attachCard, getCustomerCardList, deleteCartitem} = this;
         
         return (
            <DataContext.Provider value = {{restaurantsList, addToCart, getCartlength, getCartDetails,storesList, cartList, total, responseSuccess, authenticate, timeZone, responsedKey, commonRefreshToken, refreshTokenApi, storeName, storeNameFunction, sessionToken, restaurentId, loading, loadingFunction, message,
              styleList,
              alertDisplay,
              yellowBlur,
              errorHandlingFunction,
              yellowBlurHiddenFunction,
              baseUrlWebApi, baseURL, baseURLNew,
              attachCard, cardList, getCustomerCardList,
              cartTotalAmount, verifyNetwork, deleteCartitem
            }}>
                {this.props.children}
            </DataContext.Provider> 
        )
    }
}