import React, { Component } from 'react';
import Restaurants from './section/Restaurants';
import MenuItems from './section/MenuItemsFinal';
import { Route, Router, Switch } from 'react-router';
import Cart from './section/Cart';
import StoreCalender from './section/StoreCalender';
import Categories from './section/Categories';
import userBrowserHistory from './History';
import StepForm from './StepForm';
import Health from './Health';
import Header from './Header';
import NotFound from './common/pageNotFound';
import Address from './section/customer/addressBook/address';
import AddressForm from './section/customer/addressBook/addressForm';
import NotificationForm from './section/customer/notifications/notificationForm';
import OrderHistory from './section/customer/orderHistory/orderHistory';
import FeedbackForm from './section/customer/feedback/feedbackForm';

export class RoutingSection extends Component {
    render() {
        return (
            <Router history = {userBrowserHistory}>
                <Header/>
                <Switch>
                    <Route path = "/" exact component = {Restaurants}/>
                    <Route path = "/inventoryList"  exact component = {MenuItems} />
                    <Route path="/cart" exact component={Cart}  />
                    <Route path="/restaurant/storecalender" exact component={StoreCalender}/>
                    <Route path="/restaurant/categories" exact component={Categories}/>
                    <Route path="/stepVerification" component = {StepForm} />
                    <Route path="/health" component={Health} />
                    <Route path="/address/form" component = {AddressForm} />
                    <Route path="/address" component = {Address} />
                    <Route path="/notifications" component = {NotificationForm} />
                    <Route path="/order-history" component = {OrderHistory} />
                    <Route path="/feedback" component = {FeedbackForm} />
                    
                    <Route path="*">
                        <Route path = "*" component = {NotFound}/>
                    </Route>
                </Switch>
            </Router>
        )
    }
}

export default RoutingSection;
