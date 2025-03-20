import React, { Component } from 'react';
import {DataContext} from '../../../Context';
import '../../../css/Restaurants.css';
import '../../../css/address.css';
import userBrowserHistory from '../../../History';
import Loading from "../../loading";
import axios from 'axios';
import {Form, Row, Col} from "react-bootstrap";
import AlertData from "../../alert";
import Rating from "./rating";

export class FeedbackForm extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            validated:false,
            feedback: ''
        };
    }
    componentDidMount(){
        if(this.context.authenticate){
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
            let body = {"Feedback": this.state.feedback}
            if(this.context.authenticate){
                this.updateCustomerFeedback(body);
            }else{
                userBrowserHistory.push('/')
                this.context.yellowBlurHiddenFunction(true);
            }

        }
    };

    onChangeValue = (event) => {
        this.setState({
            [event.target.name]:event.target.value
        })
    }
    updateCustomerFeedback = (body) => {
        const token = localStorage.getItem("sessionToken")
        this.context.loadingFunction(true)
        
        axios.post('/api/users/v1/me/feedback',body, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
          .then(res => {
                console.log("feedback res", res)
                this.context.errorHandlingFunction(true, "alert-success", res.data?.data);
                this.context.loadingFunction(false)
          })
          .catch(err => {
            console.log("feedback insert error", err.response)
            this.context.errorHandlingFunction(true, "alert-danger", err.response?.data + "("+err.response?.status+")");
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
                            Feedback
                        </h3>
                </div>
                <Rating/>
                <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit} className="mt-3">
                    <Row className="mb-3">
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Anything that can be improved?</Form.Label>
                            <Form.Control as="textarea" name="feedback"  onChange={this.onChangeValue} value={this.state.feedback} rows={3} placeholder="Your Feedback (optional)"  />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3"></Form.Group>
                        <Form.Group as={Col} md="4" className="mb-3 d-flex justify-content-end">
                            <Col xs={3}></Col>
                            <Col xs={4}><button className="btn btn-primary button-primary w-100" type="submit">{"Save"}</button></Col>
                            <Col xs={1}></Col>
                            <Col xs={4}><button className="btn btn-light button-light w-100" style={{borderColor:'#6a40c0'}} onClick={()=> userBrowserHistory.push('/')}>Cancel</button></Col>
                        </Form.Group>
                        
                    </Row>
                </Form>
                </div>
            </div>
            </>
        )
    }
}

export default FeedbackForm