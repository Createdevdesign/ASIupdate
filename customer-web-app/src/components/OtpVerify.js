import React, { useState } from 'react';
import styles from './css/Style.css';
import axios from 'axios';
import Logo from '../images/logo-main.png';
import userBrowserHistory from './History';

function OtpVerify(props) {
	axios.defaults.withCredentials = true;

	const [error, setError] = useState({
		error: '',
		success: '' 
	});
	const { value, handleChange/*, handleResponseKey*/ ,contextData } = props;
	const back = (e) => {
		e.preventDefault();
		props.prevStep();
	};

	const confirmOtp = () => {
		let deviceId = localStorage.getItem('X-SS-DEVICE-ID')
		contextData.loadingFunction(true);
		if(value.code === '1234'){
				localStorage.setItem("sessionToken",'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NWZjM2QxZS0yMWQzLTQ5MTQtOGUzYy0zZjBjOTUxMzQ2YmQiLCJzdWIiOiJZall5TlRVeVlqRXRPREZqWXkwMFlqVTFMVGxpTkdVdE5EQm1OakpoWXpnell6STUiLCJjbGllbnRJZCI6Ik0ySTNZVFZoTVdRdE16SmhNaTAwTVRJekxXSXdOV1F0TXpsbE1qWTFOVFZqTURNNSIsImlzc3VlciI6ImRldi1hdXRoZW50aWNhdG9yIiwidW5pcXVlX25hbWUiOiIrOTE5OTg1MTQzNjIzIiwiRGV2aWNlSWQiOiJ7e3gtZGV2aWNlLWlkfX0iLCJpc3N1ZWRfZGF0ZSI6Ijk4MiIsImV4cGlyZXNfaW4iOiI5ODIiLCJyb2xlIjpbIkNVU1RPTUVSIl0sImlhdCI6MTY0MTE4OTEwMywiZXhwIjoxNjcyNzI1NzAzfQ.V7-decO3Ej03M9AYDA7_VIX_-2DfKJJhQboYYIQJ_6k')
				localStorage.setItem('auth',true)
				contextData.responsedKey();
				contextData.storesList('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NWZjM2QxZS0yMWQzLTQ5MTQtOGUzYy0zZjBjOTUxMzQ2YmQiLCJzdWIiOiJZall5TlRVeVlqRXRPREZqWXkwMFlqVTFMVGxpTkdVdE5EQm1OakpoWXpnell6STUiLCJjbGllbnRJZCI6Ik0ySTNZVFZoTVdRdE16SmhNaTAwTVRJekxXSXdOV1F0TXpsbE1qWTFOVFZqTURNNSIsImlzc3VlciI6ImRldi1hdXRoZW50aWNhdG9yIiwidW5pcXVlX25hbWUiOiIrOTE5OTg1MTQzNjIzIiwiRGV2aWNlSWQiOiJ7e3gtZGV2aWNlLWlkfX0iLCJpc3N1ZWRfZGF0ZSI6Ijk4MiIsImV4cGlyZXNfaW4iOiI5ODIiLCJyb2xlIjpbIkNVU1RPTUVSIl0sImlhdCI6MTY0MTE4OTEwMywiZXhwIjoxNjcyNzI1NzAzfQ.V7-decO3Ej03M9AYDA7_VIX_-2DfKJJhQboYYIQJ_6k')
				contextData.getCartlength(localStorage.getItem("restaurentId"));
				contextData.loadingFunction(false);
				contextData.errorHandlingFunction(true, "alert-success", "Login Successfully")
				userBrowserHistory.push(props.location.state.location, props.location.state)
		}else{
			contextData.loadingFunction(false);
				// contextData.errorHandlingFunction(true, "alert-danger", error.response?.data?.msg + "("+error.response?.status+")")
		}
		// axios.post(contextData.baseUrlWebApi + '/api/ui/verify/sms', {
		// 		code: `${value.code}`,
		// 		response_key: `${value.response_key}`,
		// 		request_id:`${value.request_id}`,
		// 		notificationId: "abcd",
		// 		deviceId:deviceId
		// 	})
		// 	.then(function (res) {
		// 		localStorage.setItem("sessionToken",res.data.access_token)
		// 		localStorage.setItem('auth',true)
		// 		contextData.responsedKey();
		// 		contextData.storesList(res.data.access_token)
		// 		contextData.getCartlength(localStorage.getItem("restaurentId"));
		// 		contextData.loadingFunction(false);
		// 		contextData.errorHandlingFunction(true, "alert-success", "Login Successfully")
		// 		userBrowserHistory.push(props.location.state.location, props.location.state)
		// 	})
		// 	.catch(function (error) {
		// 		console.log("OTP verify error", error)
		// 		contextData.loadingFunction(false);
		// 		contextData.errorHandlingFunction(true, "alert-danger", error.response?.data?.msg + "("+error.response?.status+")")
		// 		setError({ ...error, error: error.response.data.msg });
		// 	});
	};
	return (
		<div className="pt100 mainscreen-bg	">
			<div className={styles}>
				<div className={styles.background}>



					<div className="container  ">
						<div className="row">
							<div className="col-sm-4"></div>
							<div className="col-sm-4">

							<div className="div-rel">
								<div className="htl-box htl-box-trans">

									<img src={Logo} alt=""   className="loginpage-img" />


									<div className={styles.error}>{error.error}</div>
									<div className={styles.success}>{error.success}</div>

									<div className={styles.input_container}>
										<div className="form-group">
											<label>Enter One Time Password:</label>

											<input
												type="tel"
												value={value.code}
												onChange={handleChange('code')}
												placeholder="Enter the 4 digits OTP"
												className="form-control"
											/>
										</div>


									</div>

									<div className="row">

										<div className="col-sm-6 ">
											<button onClick={back} className="btn btn-primary btn-primary-adj">
												Back
											</button>
										</div>
										<div className="col-sm-6">
											<button onClick={confirmOtp} className="btn btn-primary btn-primary-adj">
												Confirm OTP
											</button>
										</div>
									</div>
								</div>
							</div>
							</div>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}

export default OtpVerify;
