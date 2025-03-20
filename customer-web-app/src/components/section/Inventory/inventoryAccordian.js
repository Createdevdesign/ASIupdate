import React from 'react';
// import Form from 'react-bootstrap/Form'
class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.inputRef = React.createRef();
		this.state = {
			height: 0,
			
		};
	}

	componentDidMount() {
		window.setTimeout(() => {
			const height = this.inputRef.current.scrollHeight;
          	this.setState({
				height
			});
		}, 333);
	}

	render () {
		const { Name, ProductAttributeId, ProductAttributes, ProductAttributeValues, activeTab, index, activateTab, onChange } = this.props;
		const { height } = this.state;
		const isActive = activeTab === index;
		const innerStyle = {
			height:  `${isActive ? height : 0}px`
		}
		return (
			<div className='panel panelHeaderData'
			style={{borderBottom:ProductAttributes.length - 1 === index ?"1px solid #F2F2F2": "none"}}
				// role='tabpanel'
				aria-expanded={ isActive }
				>
				<button className='panel__label'
					role='tab'
					onClick={ activateTab }>
					{/* { label } */}
					{Name}
                    <span style={{float:"right"}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
							<rect width="30" height="30" rx="5" fill="#219653" fillOpacity={"0.1"}/>
							<path d="M9 12L15 18L21 12" stroke="#219653" strokeWidth={"2"} strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						{/* <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
							<rect width="42" height="42" rx="5" transform="matrix(1 0 0 -1 0 42)" fill="#219653" fillOpacity="0.1"/>
							<path d="M15 24L21 18L27 24" stroke="#219653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg> */}
					</span>
				</button>
				<div className='panel__inner'
					style={ {...innerStyle, paddingTop:"10px"} }
					aria-hidden={ !isActive }
					ref={this.inputRef}

					>
						
					{ProductAttributeValues.map((attributes, index) =>
					<label className="productAttributeValue" key={index} style={{ width:"100%"}}>
						
						<input type="checkbox"  onClick={(e)=> onChange(e.target.checked, attributes["_id"], ProductAttributeId, index)} />
						<span className="checkmark"></span>
						<div className="cost" style={{paddingTop:"2px"}} >
							{attributes?.Name}
							<span className="cost" style={{ float:"right", fontWeight:"bold" }} >{"$ " + attributes?.Cost.toFixed(2)}</span>
						</div>
						{/* {arr.length - 1 === index ? <hr/>:null} */}
					</label>
						// <p className='panel__content' key={index}>
						// 	{attributes?.Name} - {attributes?.Cost}
						// </p>
					)}
				</div>
			</div>
		);
	}
}

class Accordion extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			activeTab: ""
		};
		
		this.activateTab = this.activateTab.bind(this);
	}
	
	activateTab(index) {
		this.setState(prev => ({
			activeTab: prev.activeTab === index ? -1 : index
		}));
	}
	
	render() {
		const { ProductAttributes, onChange } = this.props;
        // const panels = [
        //     {
        //         label: 'Would you like flats or drumettes only?',
        //         content: 'Icons are everywhere. These "little miracle workers" (as John Hicks described them) help us reinforce meaning in the interfaces we design and build. Their popularity in web design has never been greater; the conciseness and versatility of pictograms in particular make them a lovely fit for displays large and small. But icons on the web have had their fair share of challenges.',
        //     },
        //     {
        //         label: 'Screen Readers Actually Read That Stuff',
        //         content: 'Most assistive devices will read aloud text inserted via CSS, and many of the Unicode characters icon fonts depend on are no exception. Best-case scenario, your "favorite" icon gets read aloud as "black favorite star." Worse-case scenario, it\'s read as "unpronounceable" or skipped entirely.',
        //     }
        // ];
        
		const { activeTab } = this.state;
		return (
			<div className='accordion mt-2 scrollCss' role='tablist' style={{ /*height:"230px",*/ overflow:"auto", whiteSpace:"normal" }}>
				{ProductAttributes.map((panel, index) =>
					<Panel
						key={ index }
						activeTab={ activeTab }
						index={ index }
						{ ...panel } 
						activateTab={ this.activateTab.bind(null, index) }
						ProductAttributes={ProductAttributes}
						onChange={onChange}
					/>
				)}
			</div>
		);
	}
}


export default Accordion;