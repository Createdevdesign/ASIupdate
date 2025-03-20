import React, { Component } from 'react';
import {DataContext} from '../../../Context';
import '../../../css/Restaurants.css';
import '../../../css/address.css';
import userBrowserHistory from '../../../History';
import Loading from "../../loading";
import axios from 'axios';
import {Form, Row, Col} from "react-bootstrap";
import AlertData from "../../alert";

export class CustomerNotification extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            validated:false,
            sms: false,
            email: false,
            App: false
        };
    }
    getPreferedNotification = (addressId) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get('/api/users/v1/me/preferences', {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
              let preferedNotificationData = res.data['preferred-notifications'] === undefined?{}:res.data['preferred-notifications'];
              this.setState({ 
                sms: preferedNotificationData.sms,
                email: preferedNotificationData.email,
                App: preferedNotificationData.App
              });
            this.context.loadingFunction(false)
            
          })
          .catch(err => {
            console.log("get prefered notification detail error", err.response)
            if(err.response?.data?.message === "jwt expired"){
              let serviceType = "ANONYMOUS"
              if(this.context.authenticate){
                serviceType = "CUSTOMER"
              }
              this.context.commonRefreshToken(serviceType)
            }
            this.context.loadingFunction(false);
            
          });
    }
    componentDidMount(){
        
        if(this.context.authenticate){
            this.getPreferedNotification();
            this.context.yellowBlurHiddenFunction(false);
        }else{
            userBrowserHistory.push('/')
        }
    }

    handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
          this.setState({validated:true});
        }
        event.preventDefault();
        
        if (form.checkValidity() === true) {
            this.context.restaurentId = localStorage.getItem("restaurentId")
            this.context.loadingFunction(true)
            let body = {"preferred-notifications": {
                sms: this.state.sms,
                email: this.state.email,
                App: this.state.App
            }}
            if(this.context.authenticate){
                this.updatePreferedNotification(body);
            }else{
                userBrowserHistory.push('/')
                this.context.yellowBlurHiddenFunction(true);
            }

        }
    };

    onChangeValue = (event) => {
        this.setState({
            [event.target.name]:event.target.checked
        })
    }
    updatePreferedNotification = (body) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        
        axios.post('/api/users/v1/me/preferences',body, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
                console.log("update res", res)
                this.context.errorHandlingFunction(true, "alert-success", "Customer prefered notification updated successfully");
                // userBrowserHistory.push('/address')
                this.getPreferedNotification();
                
                this.context.loadingFunction(false)
          })
          .catch(err => {
            console.log("get update prefered notifications error", err.response)
            this.context.errorHandlingFunction(true, "alert-danger", err.response?.data + "("+err.response?.status+")");
            this.getPreferedNotification();
            if(err.response?.data?.message === "jwt expired"){
              let serviceType = "ANONYMOUS"
              if(this.context.authenticate){
                serviceType = "CUSTOMER"
              }
              this.context.commonRefreshToken(serviceType)
            }
            
            this.context.loadingFunction(false);
          });
    }
    render() {
        return (
            <>
                <Loading loading={this.context.loading}/>
                <AlertData show={this.context.alertDisplay} style={this.context.styleList} message={this.context.message} />
                <div id = "restaurant" className="container menuItems">
                <div className="borderTopCss paddingAddress">

                <div className="d-flex justify-content-between" style={{minHeight:"80px", paddingTop:"10px"}}>
                        <h3  className="show-curson-icon" style={{fontFamily: "Righteous", fontStyle:"normal", fontWeight:"400", fontSize: '36px', lineHeight: "45px", color: "#23212A"}} >
                            Notification
                        </h3>
                </div>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit} className="mt-3">
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" className="mb-3">
                            <Form.Check
                                label="SMS"
                                name="sms"
                                onChange={this.onChangeValue}
                                checked={this.state.sms}
                                // value={this.state.Default}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3">
                            <Form.Check
                                label="EMAIL"
                                name="email"
                                onChange={this.onChangeValue}
                                checked={this.state.email}
                                // value={this.state.Default}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3">
                            <Form.Check
                                label="APP NOTIFICATION"
                                name="App"
                                onChange={this.onChangeValue}
                                checked={this.state.App}
                                // value={this.state.Default}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3 d-flex justify-content-end">
                            <Col xs={5}></Col>
                            <Col xs={3}><button className="btn btn-primary button-primary w-100" type="submit">{"Update"}</button></Col>
                            <Col xs={1}></Col>
                            <Col xs={3}><button className="btn btn-light button-light w-100" style={{borderColor:'#6a40c0'}} onClick={()=> userBrowserHistory.push('/address')}>Cancel</button></Col>
                        </Form.Group>
                        
                    </Row>
                </Form>
                </div>
            </div>
            </>
        )
    }
}

export default CustomerNotification