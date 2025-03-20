import React from 'react';
import '../../css/Inventory.css';
// import {Tab, Tabs} from "react-bootstrap";

class Tabs extends React.Component{
  state ={
    activeTab: ""
  }
  changeTab = (tab) => {
    this.setState({ activeTab: tab });
  };
  render(){
    let content;
    let buttons = [];
    return (
      <div>
        {React.Children.map(this.props.children, child =>{
          buttons.push(child.props)
          if (child.props.label === this.state.activeTab) content = child.props.children
        })}
        <TabButtons activeTab={this.state.activeTab} buttons={buttons} changeTab={this.changeTab}/>
        <div className="tab-content">{content}</div>
      </div>
    );
  }
}

const TabButtons = ({buttons, changeTab, activeTab}) =>{
  return(
    <div className="tab-buttons" key={buttons}>
      
    {buttons.map((button, i) =>{
       return <button className={button === activeTab? 'active buttonsTabs': 'buttonsTabs'} onClick={()=>changeTab(button)} key={i}>
       {button.label === "Pickup"? 
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{float:"right"}} onClick={()=>button.storeTimingsEdit(button)}>
           <rect width="24" height="24" rx="5" fill="#5E41AA" fill-opacity="0.1"/>
           <path d="M12.625 16.7008H18.25" stroke="#5E41AA" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M15.4375 6.38833C15.6861 6.13968 16.0234 6 16.375 6C16.5491 6 16.7215 6.03429 16.8824 6.10092C17.0432 6.16755 17.1894 6.26521 17.3125 6.38833C17.4356 6.51144 17.5333 6.6576 17.5999 6.81845C17.6665 6.97931 17.7008 7.15172 17.7008 7.32582C17.7008 7.49993 17.6665 7.67234 17.5999 7.8332C17.5333 7.99405 17.4356 8.14021 17.3125 8.26332L9.5 16.0758L7 16.7008L7.625 14.2008L15.4375 6.38833Z" stroke="#5E41AA" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
         :
         null
       }
       <span className={"buttonheaderData"}>{button.label}</span>
       <br/>
       <span className={"buttonFooterData"}>{button.values}</span>
     </button>
    })}
    </div>
  )
}

const Tab = props =>{
  return(
    <React.Fragment>
      {props.children}
    </React.Fragment>
  )
}
 
class UnderlineTabs extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        tabsArray: props.tabsArray,
        yourPick: 'Delivery',
        lazy:[]
      }
    }
    render() {
      return (
          <>
            {/* <div className="tabs"> */}
            <div className="">
            <Tabs>
              {this.props.tabsArray.map((item,i) => (
                <Tab label={item.Menus} values={item.timings} storeTimingsEdit={item.storeTimingsEdit}
                selectedDate= {item.selectedDate}
                selectedTime= {item.selectedTime}
                key={i}
                 >
                </Tab>
              ))}
            </Tabs>
            </div>
            
          </>
        
      )
    }
    
  }
  
  export default UnderlineTabs;