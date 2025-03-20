import React, { Component } from 'react';
import {DataContext} from '../../../Context';
import '../../../css/rating.css';


export class RatingForm extends Component {

    static contextType = DataContext;
    constructor() {
        super();
        this.state = {
            validated:false,
            rating: 3,
            temp_rating:null
        };
    }
    rate = (rating) => {
        console.log("rating", rating)
        this.setState({
          rating: rating,
          temp_rating: rating
        });
    }

    star_over = (rating) => {
        // this.state.temp_rating = this.state.rating;
        // this.state.rating = rating;
        // this.setState({
        //   rating: this.state.rating,
        //   temp_rating: this.state.temp_rating
        // });
        this.setState({
            rating: rating,
            temp_rating: this.state.temp_rating
          });

    }
      star_out = () => {
        // this.state.rating = this.state.temp_rating;
        
        this.setState({ rating: this.state.rating });
      }
    // componentDidMount(){
    //     if(this.context.authenticate){
    //         this.context.yellowBlurHiddenFunction(false);
    //     }else{
    //         userBrowserHistory.push('/')
    //     }
    // }

    // handleSubmit = (event) => {
    //     const form = event.currentTarget;
    //     if (form.checkValidity() === false) {
    //       event.preventDefault();
    //       event.stopPropagation();
    //       this.setState({validated:true});
    //     }
    //     event.preventDefault();
        
    //     if (form.checkValidity() === true) {
    //         this.context.restaurentId = localStorage.getItem("restaurentId")
    //         this.context.loadingFunction(true)
    //         let body = {"Feedback": this.state.feedback}
    //         if(this.context.authenticate){
    //             this.updateCustomerFeedback(body);
    //         }else{
    //             userBrowserHistory.push('/')
    //             this.context.yellowBlurHiddenFunction(true);
    //         }

    //     }
    // };

    // onChangeValue = (event) => {
    //     this.setState({
    //         [event.target.name]:event.target.value
    //     })
    // }
    // updateCustomerFeedback = (body) => {
    //     const token = localStorage.getItem("sessionToken")
    //     this.context.loadingFunction(true)
        
    //     axios.post('/api/users/v1/me/feedback',body, {baseURL:this.context.baseURLNew, withCredentials:false,headers : {"authorization" : "Bearer "+token}})
    //       .then(res => {
    //             console.log("feedback res", res)
    //             this.context.errorHandlingFunction(true, "alert-success", res.data?.data);
    //             this.context.loadingFunction(false)
    //       })
    //       .catch(err => {
    //         console.log("feedback insert error", err.response)
    //         this.context.errorHandlingFunction(true, "alert-danger", err.response?.data + "("+err.response?.status+")");
    //         if(err.response?.data?.message === "jwt expired"){
    //           let serviceType = "ANONYMOUS"
    //           if(this.context.authenticate){
    //             serviceType = "CUSTOMER"
    //           }
    //           this.context.commonRefreshToken(serviceType)
    //         }
            
    //         this.context.loadingFunction(false);
    //       });
    // }
    render() {

        var stars = [];
    
    for(var i = 1; i < 6; i++) {
      var klass = 'star-rating__star';
      if (this.state.rating >= i && this.state.rating != null) {
        klass += ' is-selected';
      }

      stars.push(
        <label
          className={klass}
          key={i}
          onClick={this.rate.bind(this, i)}
        //   onMouseOver={this.star_over.bind(this, i)}
        //   onMouseOut={this.star_out}
          >
          ★
        </label>
            );
        }
        return (
            <>
            <div>
                <p>Rating your experience with our product.</p>
                {/* <Rating /> */}
                <div className="star-rating">
                    {stars}
                </div>
            </div>
            </>
        )
    }
}

export default RatingForm