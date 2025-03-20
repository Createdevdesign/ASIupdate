import React from 'react';
import axios from 'axios';
import Logo from '../images/logo-main.png';
import PhoneInputData from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import Loading from "./section/loading";
import AlertData from "./section/alert";

function PhoneInput(props) {
	const { value, handleChange, hashHandleChange, handleResponseKey, contextData } = props;
	const Continue = (e) => {
		let deviceId = localStorage.getItem('X-SS-DEVICE-ID')
		contextData.loadingFunction(true);
		
		// axios
		// 	.post(contextData.baseUrlWebApi + '/api/ui/authenticate/sms', {
		// 		phoneNumber: `${value.PhoneNumber}`,
		// 		deviceId: deviceId
		// 	})
		// 	.then(function (res) {
		// 		const hash = 'hashkey';
		// 		const response_key = res.data.ResponseKey;
		// 		const request_id = res.data.RequestId;
		// 		hashHandleChange(hash);
		// 		handleResponseKey(response_key, request_id);
		// 		contextData.loadingFunction(false);
		// 		contextData.errorHandlingFunction(true, "alert-success", "OTP sended to your number")
		// 		props.nextStep();
		// 	}).catch(err => {
		// 		console.log("sms authenticate message", err.response)
		// 		contextData.loadingFunction(false);
		// 		contextData.errorHandlingFunction(true, "alert-danger", err.response?.data?.message + "("+err.response?.status+")")
		// 	}
		// 	);
		props.nextStep();
		e.preventDefault();

	};
	return (
		<div className="container-fluid pt100 mainscreen-bg ">
			<Loading loading={contextData.loading}/>
			<AlertData show={contextData.alertDisplay} style={contextData.styleList} message={contextData.message}/>
			<div className="row">
				<div className="col-sm-4"></div>
				<div className="col-sm-4">
					<div className="div-rel">
						<div className="htl-box htl-box-trans">
							<img src={Logo} alt="" className="loginpage-img" />
							<div className="row">
								<div className="col-sm-12 col-12">
									<div className="form-group">
										<small className="ml-2"> Phone Number: </small>
									</div>
								</div>
							</div>
							
							<div className="">
								<div className="row">
									<div className="col-sm-12 col-12">
										<PhoneInputData
												country={'us'}
												value={value.PhoneNumber}
												onChange={handleChange('PhoneNumber')}
												enableSearch={true}
												onlyCountries={['in', 'us']}
												inputStyle={{width:"100%"}}
												defaultErrorMessage="phone invalid"
												enableClickOutside={true}
												// isValid={(value, country) => {
												// 	if (value==="") {
												// 	  return 'Type your phone here ';
												// 	} else if (value==="") {
												// 	  return false;
												// 	} else {
												// 	  return true;
												// 	}
												//   }}
												  placeholder="Type your phone here"
											/>
									</div>
								</div>
							</div>



							<button onClick={Continue} className="btn btn-primary btn-primary-adj">
								Send OTP
							</button></div>
					</div>

				</div>
			</div>



		</div>
	);
}

export default PhoneInput;