import React from 'react';

class TabButtons extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        coffeeTypes: props.arrayData,
        yourPick: props.selectedValue,
        lazy:[]
      }
    }
    handleRadio(e) {
      // multiple selection
      let hello = this.state.lazy.filter(item=>item === e.target.value)
      
      if(hello.length === 0){
        this.setState({ lazy: [...this.state.lazy,e.target.value] })
      }
      if(hello.length === 1){
        let deleteData = this.state.lazy.filter(item=>item !== e.target.value)
        this.setState({ lazy: deleteData })
      }
      // single selection
      this.setState({ yourPick: e.target.value })
      
    }
    render() {
      // const options = this.state.coffeeTypes.map((loan, key) => {
        const options = this.props.arrayData.map((loan, key) => {
        // for single select
        const isCurrent = this.props.selectedValue === loan 
        // for multiple select
        // const isCurrent = this.state.lazy.includes(loan)
        return (
          <div 
            key={key} 
            className="radioPad"
          >
              <label 
                className={
                  isCurrent ? 
                    'radioPad__wrapper radioPad__wrapper--selected' :
                    'radioPad__wrapper'
                  }
              >
                <input
                  className="radioPad__radio"
                  type="radio" 
                  name="coffeeTypes" 
                  id={loan} 
                  value={loan}
                  // onClick={this.props.handleSelected.bind(this)}
                  onClick={this.props.handleSelected}
                />
                {loan}
              </label>
          </div>
        )
      })
      return (
          <>
            {options}
          </>
        
      )
    }
    
  }
  
  export default TabButtons;