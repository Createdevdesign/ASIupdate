import React, { Component } from 'react';
import {DataContext} from '../../../Context';
import '../../../css/Restaurants.css';
import '../../../css/address.css';
import userBrowserHistory from '../../../History';
import Loading from "../../loading";
import axios from 'axios';
import {Form, Row, Col} from "react-bootstrap";

export class AddressForm extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            validated:false,
            FirstName: "",
            LastName: "",
            Email: "",
            Company: "",
            PhoneNumber: "",
            Address1:"",
            Address2: "",
            City: "",
            StateProvinceId: "",
            CountryId: "",
            ZipPostalCode: "",
            Default: false,
            stateArray:[]
        };
     
    }
    getAddressBookDetail = (addressId) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get('/api/address-book/v1/address/'+addressId, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
              let addressData = res.data.data[0];
              this.setState({ 
                FirstName: addressData.FirstName,
                LastName: addressData.LastName,
                Email: addressData.Email,
                Company: addressData.Company,
                PhoneNumber: addressData.PhoneNumber,
                Address1:addressData.Address1,
                Address2: addressData.Address2,
                City: addressData.City,
                StateProvinceId: addressData.StateProvinceId,
                CountryId: addressData.CountryId,
                ZipPostalCode: addressData.ZipPostalCode,
                Default: addressData.Default,
              });
            this.context.loadingFunction(false)
          })
          .catch(err => {
            console.log("get address book detail error", err.response)
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
            if(userBrowserHistory.location.state?.addressId){
                this.getAddressBookDetail(userBrowserHistory.location.state?.addressId);
            }
            this.getStateProvinceArray();
            this.context.yellowBlurHiddenFunction(false);
        }else{
            userBrowserHistory.push('/')
        }
        // this.getAddressBook();
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
            let body = {
                FirstName: this.state.FirstName,
                LastName: this.state.LastName,
                Email: this.state.Email,
                Company: this.state.Company,
                PhoneNumber: this.state.PhoneNumber,
                StateProvinceId: this.state.StateProvinceId,
                Address1: this.state.Address1,
                Address2: this.state.Address2,
                City: this.state.City,
                CountryId: this.state.CountryId,
                ZipPostalCode: this.state.ZipPostalCode,
                Default: this.state.Default
            }
            if(this.context.authenticate){
                if(userBrowserHistory.location.state?.addressId){
                    this.updateAddress(body, userBrowserHistory.location.state?.addressId);
                }else{
                    this.insertAddress(body);
                }
                
            }else{
                userBrowserHistory.push('/')
                this.context.yellowBlurHiddenFunction(true);
            }

        }
    };

    onChangeValue = (event) => {
        this.setState({
            [event.target.name]:event.target.name === "Default"?event.target.checked:event.target.value
        })
    }
    getStateProvinceArray = () => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        axios.get('/api/stores/v1/me/stateProvincess', {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
                this.setState({stateArray:res.data?.result?.stateProvinces})
                this.context.loadingFunction(false)
          })
          .catch(err => {
            console.log("get state provice error", err.response)
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

    insertAddress = (body) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        
        axios.post('/api/address-book/v1/address',body, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
                console.log("insert res", res)
                userBrowserHistory.push('/address')
                this.context.loadingFunction(false)
                
          })
          .catch(err => {
            console.log("get state provice error", err.response)
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
    updateAddress = (body, addressId) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        
        axios.put('/api/address-book/v1/address/'+addressId,body, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
                console.log("update res", res)
                userBrowserHistory.push('/address')
                this.context.loadingFunction(false)
          })
          .catch(err => {
            console.log("get update address error", err.response)
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
                <div id = "restaurant" className="container menuItems">
                <div className="borderTopCss paddingAddress">

                <div className="d-flex justify-content-between" style={{minHeight:"80px", paddingTop:"10px"}}>
                        <h3  className="show-curson-icon" style={{fontFamily: "Righteous", fontStyle:"normal", fontWeight:"400", fontSize: '36px', lineHeight: "45px", color: "#23212A"}} >
                            Address Form
                        </h3>
                </div>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit} className="mt-3">
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" controlId="validationCustom01">
                            <Form.Label>First name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="First name"
                                name="FirstName"
                                onChange={this.onChangeValue}
                                value={this.state.FirstName}
                            />
                            <Form.Control.Feedback type="invalid">
                                First name is required field
                            </Form.Control.Feedback>
                            {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="validationCustom02">
                            <Form.Label>Last name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Last name"
                                name="LastName"
                                onChange={this.onChangeValue}
                                value={this.state.LastName}
                            />
                            <Form.Control.Feedback type="invalid">
                                Last name is required field
                            </Form.Control.Feedback>
                            {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                required
                                type="number"
                                placeholder="Phone Number"
                                name="PhoneNumber"
                                onChange={this.onChangeValue}
                                value={this.state.PhoneNumber}
                            />
                            <Form.Control.Feedback type="invalid">
                                Phone number is required field
                            </Form.Control.Feedback>
                            {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="validationCustom01">
                            <Form.Label>Address 1</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Address 1"
                                name="Address1"
                                onChange={this.onChangeValue}
                                value={this.state.Address1}
                            />
                            <Form.Control.Feedback type="invalid">
                                Address 1 is required field
                            </Form.Control.Feedback>
                            {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="validationCustom02">
                            <Form.Label>Address 2</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Address 2"
                                name="Address2"
                                onChange={this.onChangeValue}
                                value={this.state.Address2}
                            />
                            <Form.Control.Feedback type="invalid">
                                Address 2 is required field
                            </Form.Control.Feedback>
                            {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                    <Form.Group as={Col} md="4" controlId="validationCustom01">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="City"
                                name="City"
                                onChange={this.onChangeValue}
                                value={this.state.City}
                            />
                            <Form.Control.Feedback type="invalid">
                                City is required field
                            </Form.Control.Feedback>
                            {/* <Form.Control.Feedback>Looks good!</Form.Control.Feedback> */}
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="validationCustom03">
                            <Form.Label>State</Form.Label>
                            <Form.Select  
                                required 
                                name="StateProvinceId"
                                onChange={this.onChangeValue}
                                value={this.state.StateProvinceId}>
                                <option value="">Select State *</option>
                                {this.state.stateArray.map((item,i) =><option key={i} value={item.stateProvinceId}>{item.name}</option>)}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select service type.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="validationCustom05">
                            <Form.Label>Zip code</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Zip code"
                                name="ZipPostalCode"
                                onChange={this.onChangeValue}
                                value={this.state.ZipPostalCode}
                            />
                            <Form.Control.Feedback type="invalid">
                                Zip Code is required field
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3">
                            <Form.Check
                                label="Make Default Address"
                                name="Default"
                                onChange={this.onChangeValue}
                                checked={this.state.Default}
                                // value={this.state.Default}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3 d-flex justify-content-end">
                            <Col xs={5}></Col>
                            <Col xs={3}><button className="btn btn-primary button-primary w-100" type="submit">{userBrowserHistory.location.state?.addressId?"Update":"Insert"}</button></Col>
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

export default AddressForm