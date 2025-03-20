import React from 'react';
// import {Scrollspy} from '@makotot/ghostui';
// import Scrollspy from 'react-scrollspy';
// import ScrollspyNav from "react-scrollspy-nav";
import mime from "mime";
import InventoryDetail from "./inventoryDetail";
import { DataContext } from '../../Context';
import axios from 'axios';

class InventoryList extends React.Component {
	static contextType = DataContext;

    constructor() {
        super();
        this.state = {
            inventoryShow:false,
            storeData: {}
        };
    }
	inventoryDetail = (productId) => {
        const token = localStorage.getItem("sessionToken");
    	this.context.loadingFunction(true)
    	axios.get(`/api/inventory/v1/${localStorage.getItem("restaurentId")}/products/${productId}`, { baseURL:this.context.baseURLNew, withCredentials:false,headers: { "authorization": "Bearer " + token } })
      		.then(res => {
			// this.setState({ storeData: res.data.data })
			this.setState({ storeData: res.data })
			this.context.loadingFunction(false)
      	})
			.catch(err => {
				console.log("inventory detailed data error", err)
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

	inventorySetShow = (value, productId) => {
        if(value === true){
			this.inventoryDetail(productId);
		}
	   this.setState({inventoryShow:value})
    }
render() {
  return (
	<div className='horizontalTabs' >
		<InventoryDetail inventoryShow={this.state.inventoryShow} inventorySetShow={this.inventorySetShow} storeapidata={this.state.storeData} context={this.context} />
		{/* <Scrollspy items={ this.props.categoryArrayList } currentClassName="is-current" className='scrollCss' style={{ paddingLeft:"0px", marginBottom:"10px", overflow:"auto", whiteSpace:"nowrap" }}>
			{this.props.categoryArrayList.map((item, i) => {
                                    return (<a href={"#"+item} key={i}>{item}</a>)})
			}
		</Scrollspy> */}
		{/* <ScrollspyNav scrollTargetIds={ this.props.categoryArrayList } activeNavClass="is-active" style={{ paddingLeft:"0px", marginBottom:"10px", overflow:"auto", whiteSpace:"nowrap" }}>
			<ul>
				{this.props.categoryArrayList.map((item, i) => {
										return (<li><a href={"#"+item} key={i} style={{ textDecoration:"none" }}>{item}</a></li>)})
				}
			</ul>
		</ScrollspyNav> */}

		<div className='categorySection' >
			{this.props.categoryList.map((item, index) => {
				return(
					<section id={item.Name} key={index} >
						<div className='categoryItems mb-2' >{item.Name}</div>
						<div className="row">
							{this.props.itemsList.map((list, i)=>{
								if(list.ProductCategories[0]?.CategoryId === item["_id"]){
									return(<div className={this.context.cartList.length === 0 && this.props.gridColumns === false?"col-sm-12 col-md-6 col-lg-3":"col-sm-12 col-md-6 col-lg-6"} key={i}>
												<div onClick={()=>this.props.inventoryDetail(true, list.id)} key={item.id} className="categoriesInMenuItems">
												<div>
												{/* <Link to={{ pathname: "./categories", state:{storeId:localStorage.getItem("restaurentId"), productId:list.id, storeData:this.props.state.storeName} }} onClick={this.props.navigateToCatergories} key={list.id} className="categoriesInMenuItems"> */}
													{/* <Link to={{ pathname: "./categories" }} key={list.id} className="categoriesInMenuItems"> */}
														<div className="inventoryCard justify-content-between ">
															<div className="content show-curson-icon p-2" >
																<span  className="inventory-title three-dots"  title={list.Name}>{list.Name} </span>
																<span  className="inventory-content three-dots" title={list.ShortDescription}>{list.ShortDescription} </span>
																<div className="">
																	{/* <button onClick={this.navigateToCartOrSignIn} className="btn cta-bgbtn"> Add to Bag   <span className="iconimg-wrap"><img src={sbag} alt="" /> </span>  </button> */}
																	<span  className="pm-2 inventory-price"> $ {list.Price.toFixed(2)} </span>
																</div>
														</div>
														<div className="show-curson-icon menuimg-fit">
																{list.ProductPictures.length === 0?"":<img src={list.ProductPictures.length === 0?"https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png":list.PictureUrl+"/"+list.ProductPictures[0]?.PictureId + "_" +list.ProductPictures[0]?.SeoFilename+"."+mime.getExtension(list.ProductPictures[0]?.MimeType)} alt="" />}
															</div>
														</div>
													{/* </Link> */}
												</div>
												</div>
											</div>
											)
								}else{
									return null;
								}
							})}
						</div>
					</section>
				)
			})}
			<section id={"Others"}>
				<div className="row">
								{this.props.noCategoryData.map((list, index)=>{
									return(
										// <>
											<div className={this.context.cartList.length === 0 && this.props.gridColumns === false?"col-sm-12 col-md-6 col-lg-3":"col-sm-12 col-md-6 col-lg-6"} key={index}>
												<div className="">
												<div onClick={()=>this.props.inventoryDetail(true, list.id)} key={list.id} className="categoriesInMenuItems">
												<div>
													{/* <Link to={{ pathname: "./categories", state:{storeId:localStorage.getItem("restaurentId"), productId:list.id, storeData:this.props.state.storeName} }} onClick={this.props.navigateToCatergories} key={list.id} className="categoriesInMenuItems"> */}
													{/* <Link to={{ pathname: "./categories" }} key={list.id} className="categoriesInMenuItems"> */}
														<div className="inventoryCard justify-content-between ">
															<div className="content show-curson-icon p-2" >
																<span  className="inventory-title three-dots"  title={list.Name}>{list.Name} </span>
																<span  className="inventory-content three-dots" title={list.ShortDescription}>{list.ShortDescription} </span>
																<div className="">
																	{/* <button onClick={this.navigateToCartOrSignIn} className="btn cta-bgbtn"> Add to Bag   <span className="iconimg-wrap"><img src={sbag} alt="" /> </span>  </button> */}
																	<span  className="pm-2 inventory-price"> $ {list.Price.toFixed(2)} </span>
																</div>
														</div>
														<div className="show-curson-icon menuimg-fit">
																{list.ProductPictures.length === 0?"":<img src={list.ProductPictures.length === 0?"https://swiftserve-images.s3.us-east-2.amazonaws.com/MicrosoftTeams-image+(8).png":list.PictureUrl+"/"+list.ProductPictures[0]?.PictureId + "_" +list.ProductPictures[0]?.SeoFilename+"."+mime.getExtension(list.ProductPictures[0]?.MimeType)} alt="" />}
															</div>
														</div>
													</div>
												</div>
											</div>
											</div>
										// </>
									)
								})}
				</div>
			</section>
		</div>
		
		</div>
  );
}
}
// App = withRouter(App);
export default InventoryList;


