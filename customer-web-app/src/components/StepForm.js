import React, { useState, useContext } from 'react';
import PhoneInput from './PhoneInput';
import Otpverify from './OtpVerify';
import { DataContext } from './Context';
import { useLocation } from 'react-router-dom';
const StepForm = () => {
	const [ state, setState ] = useState({
		PhoneNumber: '',
		hash: '',
		code: '',
		response_key: '',
		request_id:''
	});
	const location = useLocation();
	let data = useContext(DataContext)
	const [step, setStep] = useState(1)
	const handleChange = (input) => (e) => {
		setState(prevState => ({
			...prevState,
			[input]: input === "PhoneNumber"?'+'+e:e.target.value
		}));
		//setState({...state, [input]: e.target.value });
	};
	const hashHandleChange = (hash) => {
		setState(prevState => ({
			...prevState,
			hash : hash
		}));
	//	setState({...state, hash : hash})
	}
	const handleResponseKey = (response_key, request_id) => {
		setState(prevState => ({
			...prevState,
			response_key : response_key,
			request_id : request_id
		}));
	//	setState({...state, response_key : response_key})
	//	console.log("handleResponseKey")
	}
	
	const handleRequestId = (response_key) => {
		setState(prevState => ({
			...prevState,
			request_id : request_id
		}));
	//	setState({...state, response_key : response_key})
	//	console.log("handleResponseKey")
	}
	const nextStep = () => {
       
		setStep(prevStep => prevStep + 1)
	};

	const prevStep = () => {
        
		setStep(prevStep => prevStep - 1)
	};
	
	const { PhoneNumber, hash, code, response_key, request_id } = state;
	const value = { PhoneNumber, hash, code, response_key, request_id };
	switch (step) {
		case 1:
			return <PhoneInput nextStep={nextStep} hashHandleChange={hashHandleChange} handleChange={handleChange} handleResponseKey={handleResponseKey} value={value} location={location} contextData={data} handleRequestId={handleRequestId} />;
		case 2:
            return <Otpverify nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} handleResponseKey={handleResponseKey} value={value} contextData={data} location={location} />;
        default:
            return <PhoneInput nextStep={nextStep} handleChange={handleChange}  value={value} location={location} />  
            
    }	
};

export default StepForm;

