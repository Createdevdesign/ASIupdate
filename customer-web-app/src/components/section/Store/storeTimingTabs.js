import React from 'react';
import '../../css/Inventory.css';
import moment from 'moment';

class Tabs extends React.Component{
  constructor(props) {
    super(props)
    this.state ={
      activeTab: props.tabsArray?.date,
      size:props.selectedCalenderTiming.value
    }
  }
  changeTab = (tab) => {
    
    this.setState({ activeTab: tab, size:"" });
  };
  handleChange=(event)=> {
    localStorage.setItem("storeTimings",moment(this.state.activeTab).format('MMMM Do')+ ", " + event.target.value) 
    this.props.handleSelectedRadioButton("menuItems",[{
      Menus:'Pickup',
      timings:moment(this.state.activeTab).format('MMMM Do')+ ", " + event.target.value,
      selectedDate: this.state.activeTab,
      selectedTime: event.target.value,
      storeTimingsEdit:this.props.storeTimingsEdit
  }])
    
    // localStorage.setItem("storeTimings",moment(this.state.activeTab).format('MMMM Do')+ ", " + event.target.value) 
    this.setState({
      size: event.target.value
    });
  }
  render(){
    let content;
    let buttons = [];
    return (
      <div>
        {React.Children.map(this.props.children, child =>{
          buttons.push(child.props)
          if (child.props.label === this.state.activeTab) content = child.props.Data
        })}
        
        <TabButtons activeTab={this.state.activeTab} buttons={buttons} changeTab={this.changeTab}/>
        {/* <div className="tab-content">{content}</div> */}
        <ul className='mt-4 scrollCss' style={{ listStyle:"none", paddingLeft:"0px", borderTop:"1px solid #F2F2F2", maxHeight:"320px", overflow:"auto" }}>
          {content=== undefined?null:content.map((item, index) => (<li key={index} style={{ padding:"10px 0px", borderBottom:"1px solid #F2F2F2" }}>
            <label style={{ width:"inherit" }}>
              
              {item + (content[index+1] === undefined?'':' - ' + content[index+1])}
              <input
                className='radioButtonCss'
                type="radio"
                value={item}
                // value={item+ (content[index+1] === undefined?'':' - ' + content[index+1])}
                checked={this.state.size === item}
                // checked={this.state.size === item+ (content[index+1] === undefined?'':' - ' + content[index+1])}
                onChange={this.handleChange}
                style={{float: "right", marginRight:"10px"}}
              />
            </label>
          </li>))}
        </ul>

      </div>
    );
  }
}
const sideScroll = (
  element: HTMLDivElement,
  speed: number,
  distance: number,
  step: number
) => {
  let scrollAmount = 0;
  const slideTimer = setInterval(() => {
    element.scrollLeft += step;
    scrollAmount += Math.abs(step);
    if (scrollAmount >= distance) {
      clearInterval(slideTimer);
    }
  }, speed);
};
const TabButtons = ({buttons, changeTab, activeTab}) =>{
  const contentWrapper = React.useRef(null);
  const [hideButtonLeft, setHideButtonLeft] = React.useState(true);
  const [hideButtonRight, setHideButtonRight] = React.useState(false);
  const [sliderWidth, setSliderWidth] = React.useState(0);
  React.useEffect(() => {
    setSliderWidth(
      document.getElementById("hscroll").scrollWidth -
        document.getElementById("hscroll").offsetWidth
    );
  }, []);
  
  const onHScroll = () => {
    const el = document.getElementById(`hscroll`).scrollLeft;
    // const er = document.getElementById(`hscroll`).sc;
    
    if (el > 0) {
      setHideButtonLeft(false);
    } else {
      setHideButtonLeft(true);
    }
    if (el < sliderWidth) {
      setHideButtonRight(false);
    } else {
      setHideButtonRight(true);
    }

    
    if (el >= sliderWidth) {
      setHideButtonRight(true);
    } 
  };
  return(
    <div style={{ display:"flex" }}>
      {hideButtonLeft?null:
      <svg className="MuiSvgIcon-root" onClick={() => {
        sideScroll(contentWrapper.current, 25, 100, -10);
      }} focusable="false" viewBox="0 0 24 24" aria-hidden="true" style={{paddingTop: "0.2rem", cursor: "pointer", width:"1.5rem"}}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
        
      }
      {/* <button className='buttonLeft'  >
              <i class="fa fa-angle-left" style={{transform: "inherit"}}></i>
            </button> */}
      <div className="store-timing-tab-buttons" id={`hscroll`} ref={contentWrapper} onScroll={() => onHScroll()}>
        {buttons.map((button, index) =>{
          return <button key={index} className={button.label === activeTab? 'active storeTimingsbuttonsTabs': 'storeTimingsbuttonsTabs'} onClick={()=>changeTab(button.label)}  >
                <span className={"storeTimeButtonFooterData"}>{moment(button.label).isSame(moment(), 'day') === true?"Today": moment(button.label).format('ddd')}</span>
                <br/>
                <span className={"storeTimeButtonheaderData"}>{moment(button.label).format('DD')/*button.values*/}</span>
              </button>
        })}
      </div>
      {hideButtonRight || sliderWidth === 0 ?null:
      <svg className="MuiSvgIcon-root" onClick={() => {
        sideScroll(contentWrapper.current, 25, 100, 10);
      }}focusable="false" viewBox="0 0 24 24" aria-hidden="true" style={{paddingTop: "0.2rem", cursor: "pointer", width:"1.5rem"}}><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>
      // <div class="next" onClick={() => {
      //         sideScroll(contentWrapper.current, 25, 100, 10);
      //       }}>
      // </div>
      }
      
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
 
class StoreTimingTabs extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        // tabsArray: props.tabsArray.length === 0?[]:props.tabsArray[0],
        tabsArray: props.calenderTimings.length === 0?[]:props.calenderTimings[props.selectedCalenderTiming.length],
        yourPick: 'Delivery',
        lazy:[]
      }
    }
    render() {
      return (<Tabs tabsArray={this.state.tabsArray} handleSelectedRadioButton={this.props.selectedRadioButtonFunction} storeTimingsEdit={this.props.editStoreTimings} selectedCalenderTiming={this.props.selectedCalenderTiming} >
              {this.props.calenderTimings.map((item, index) => (
                <Tab label={item.date} values={item.currentTime} Data={item.timings} key={index}>
                </Tab>
              ))}
            </Tabs>
            
        
      )
    }
    
  }
  
  export default StoreTimingTabs;