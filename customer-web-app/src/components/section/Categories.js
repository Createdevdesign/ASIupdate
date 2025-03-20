import '../css/Categories.css';
import React from 'react';
import axios from 'axios';
import { DataContext } from '../Context'
import sbag from '../svg/shopping-bag.png';
import userBrowserHistory from '../History';
import Loading from "./loading";

class Categories extends React.Component {

  static contextType = DataContext;

  state = {
    productsCategories: [],
    productDescription: [],
    responseReceived: false,
    selectedValue : "",
    optionValue : "",
    productAttibuteData:[],
    ProductAttributeFinalData:[],
    Attributes:[],
    quantity:1,
    additionalComment:""
  };

  componentDidMount() {
    var tempStyle = document.getElementById("menuItems");
    tempStyle.style.display = "none";
    const token = localStorage.getItem("sessionToken");
    this.context.loadingFunction(true)
    this.context.yellowBlurHiddenFunction(false);
    axios.get('/inventory/v1/c/'+this.props.location.state.storeId+'/products/'+this.props.location.state.productId, { baseURL:this.context.baseURL, withCredentials:false,headers: { "authorization": token } })
      .then(res => {
        let isRequired = res.data.data.ProductAttributes.some(item => item.IsRequired === true);
        console.log("isRequired", isRequired)
        this.setState({ productsCategories: res.data.data.ProductAttributes, productDescription: res.data.data, responseReceived: true })
        this.context.loadingFunction(false)
      })
      .catch(err => {
        console.log(err);
        console.log("categories error", err)
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
  navigateToCartOrSignIn = () => {
    if(this.context.authenticate){
      let data = {
        "Attributes": {
          "ProductAttribute":this.state.ProductAttributeFinalData
        },
        ShoppingCartType:2,
        ShoppingCartTypeId:5,
        ProductId:this.state.productDescription._id,
        Quantity:this.state.quantity,
        "Duration": "",
        "AdditionalComments": this.state.additionalComment,
        "DeliveryTime":"",
      }
      this.context.addToCart(data, this.props.location.state.storeId, userBrowserHistory);
      userBrowserHistory.push('/cart',{storeId:this.props.location.state.storeId});
    }else{
      userBrowserHistory.push('/stepVerification', {...this.props.location.state,location:this.props.location.pathname});
    }
  }
  handleChange = (value, selectOptionSetter, index) => {
    let item = this.state.ProductAttributeFinalData
    let dropdownData = this.state.productAttibuteData;
    let datafinal = dropdownData.filter(e => e['index'] === index)
    if(datafinal.length === 0){
      dropdownData.push({[index]:value, "index":index});
      item.push({ID:selectOptionSetter, ProductAttributeValue:[{Value:value}]});
    }else{
      dropdownData.forEach(element => {
        if(element["index"] === index){
          element[index] = value;
        }
      });
      item.forEach(element => {
        if(element["ID"] === selectOptionSetter){
          // element[index] = value;
          element.ProductAttributeValue.forEach((attributeValue) => {
            if(attributeValue.Value !== value){
              attributeValue.Value = value;
            }
          })
        }
      });
    }
    this.setState({productAttibuteData:dropdownData})
    this.setState({ProductAttributeFinalData : item});
    // if(item)
    // let data = productAttibuteData+'_'+selectOptionSetter;
    // this.setState({productAttibuteData_+`${selectOptionSetter}`:value})
    // if(item.length === 0){
    //   item.push({ID:selectOptionSetter, ProductAttributeValue:[{Value:value}]})
    //   this.setState({ProductAttributeFinalData : item});
    // }else{
    //   // let attributeData = []
    //   let findItemData = item.filter(e => e.ID === selectOptionSetter);
    //   if(findItemData.length === 0){
    //     item.push({ID:selectOptionSetter, ProductAttributeValue:[{Value:value}]})
    //     this.setState({ProductAttributeFinalData : item});
    //   }
      
    //   if(findItemData.length !== 0){
    //     item.forEach(element => {
    //       if(element.ID === selectOptionSetter){
    //         let data11 = element.ProductAttributeValue.filter(productValue => {
    //           return productValue.Value === value;
    //         })
    //         if(data11.length === 0){
    //           element.ProductAttributeValue.push({Value:value})  
    //         }
    //       }
    //     })
    //     this.setState({ProductAttributeFinalData : item});
    //   }
    // }
    // this.setState({productAttibuteData : value});
  }
  quantityIncreament = (name, value) => {

    if(name === "positive"){
      if(this.state.quantity < 10) {
        this.setState({quantity: value});
      }
    }
    if(name === "negative"){
      if(this.state.quantity > 1) {
        this.setState({quantity: value});
      }
    }
  }

  onChange=(value, name)=>{
    this.setState({
      [name]:value
    })
  }
  render() {
    if (this.state.responseReceived) {
      return (
        <div className=" pt100">
          <Loading loading={this.context.loading}/>
         <div className="container">

          <div className="row mt-3">
            <div className="col-sm-3"> </div>
            <div className="col-sm-6"> 
            <div className="card restaurantCard">
              {/* <img src={"https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png"} alt="No available" /> */}
              <img src={this.state.productDescription.ProductPictures[0] ? this.state.productDescription.ProductPictures[0].pictureUrl : "https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png"} alt="No available" />
              {/* <img src="" class="card-img-top" alt=""/> */}
              <div className="card-body">
                  <div className=" content">
                    <h3 className="show-curson-icon"> {this.state.productDescription.Name} </h3>
                    <p className="cuisineStyles"> {this.state.productDescription.FullDescription} </p>
                  </div>
                  {
                this.state.productsCategories.map((category, i) => (
                  <div value = {this.state.productDescription._id} key={category._id} isRequired={category.IsRequired} className="category">
                    <div className="row mt-2"> 
                    <div className="col-12">
                    <label className="show-curson-icon label-name"> {category.Name} </label>
                    {<>
                      <div className="form-group" style={{float:"right"}}>
                      <div className="selectAttributeValues">
                        <select name="format" id="format" className="mt-0"
                        style={{
                          padding: "0.375rem 0.75rem",
                          border: "1px solid #ced4da",
                          backgroundColor:"#fff",
                          backgroundClip:"padding-box",
                          borderRadius:'0.25rem',
                          
                        }}
                        onChange={e => this.handleChange(e.target.value, category._id, i)}>
                          <option selected>Choose a item</option>
                          {
                             category.ProductAttributeValues.map(productSpecification => (
                              <option key = {productSpecification.Name} value ={productSpecification._id}> {productSpecification.Name}</option>
                            ))
                          }
                        </select>
                    </div>
                    </div>
                    </>}
                    
                    </div>
                  </div>
                  </div>
                ))
              }
              <div className="mb-3"></div>
              <textarea className="form-control mb-3" id="exampleFormControlTextarea1" rows="3" placeholder="Additional Comments" onChange={e => this.onChange(e.target.value, "additionalComment")}></textarea>
              <div className=" content">
                  <div className="d-flex justify-content-between">
                      <div>
                        {/* <label className="show-curson-icon label-name"> Quantity</label> */}
                        <h3 className="show-curson-icon">Quantity</h3>
                      </div>
                      <div className="input-group w-auto justify-content-end align-items-center">
                        <input type="button" value="-" className="button-minus border rounded-circle  icon-shape icon-sm mx-1 minus-icon" data-field="quantity" onClick={(e) => this.quantityIncreament("negative",this.state.quantity - 1)}/>
                        <h3 className="show-curson-icon" style={{margin:"auto", width:"18px"}}> {this.state.quantity} </h3>
                        <input type="button" value="+" className="button-plus border rounded-circle icon-shape icon-sm plus-icon" data-field="quantity" onClick={(e) => this.quantityIncreament("positive",this.state.quantity + 1)}/>
                      </div>
                  </div>
                  <span  className="card-price" style={{float:"left"}}> $ {this.state.productDescription.Price} </span>
                  <button onClick={this.navigateToCartOrSignIn} className="btn cta-bgbtn" style={{float:"right"}}> Add to Bag   <span className="iconimg-wrap"><img src={sbag} alt="" /> </span>  </button>
              </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      
      )
    } else {
      return null
    }


// </div>
// </div>

  }
}

export default Categories;