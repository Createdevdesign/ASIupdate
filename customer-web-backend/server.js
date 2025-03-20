require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const request = require('request');
// const bodyParser = require("body-parser");
// const client = require('twilio')(accountSid, authToken);

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let refreshTokens = [];

const app = express();
app.use(express.json());

app.use(cors({ origin: ['http://localhost:3000', 'http://dev.swiftserve.us', 'http://localhost:3001'], credentials: true }));
app.use(cookieParser('Secret'));

app.post('/api/ui/authenticate/sms', (req, res) => {
	console.log("send body details",req.body)
	const phoneNumber = req.body.phoneNumber;
	const deviceId = req.body.deviceId;
	console.log("process.env.AUTH_END_POINT_NEW", process.env.AUTH_END_POINT_NEW)
	request.post({
		url: process.env.AUTH_END_POINT_NEW+'/api/auth/v1/authenticate/sms',
		headers: {
			'content-type': 'application/json',
			'Authorization': process.env.CLIENT_SECRET_ID,
			'x-device-id': deviceId
		},
		json: {
			phoneNumber,
		},
	}, (err, httpResponse, body) => {
		console.log("err", body)
	//	storeResponseKey(body.ResponseKey )
		let message = httpResponse.statusCode === 200?{ ResponseKey : body.ResponseKey}:body;
		res.status(httpResponse.statusCode).send(message);
	});
	// res.status(200).send({ ResponseKey : req.cookies });
});

app.post('/api/ui/verify/sms', (req, res) => {
	const code = req.body.code;
    const response_key = req.body.response_key;
	const notificationId = req.body.notificationId;
	const deviceId = req.body.deviceId;
	request.post({
		url: process.env.AUTH_END_POINT_NEW+'/api/auth/v1/verify/sms',
		headers: {
			'content-type': 'application/json',
			'x-device-id': deviceId
		},
		json: {
			response_key,
			code,
			notificationId
		}

	}, (err, httpResponse, body) => {
		console.log("otpverify code response.statusCode", httpResponse.body)
		console.log("--------------otp verify")
		console.log("body", body)
		console.log("--------------otp verify")
		res.status(httpResponse.statusCode).cookie("refreshToken", body?.refresh_token,{"sameSite": 'strict',
			path: '/',
			sameSite: 'strict',
			// expires: new Date(new Date().getTime() + 100 * 1000),
			// maxAge:1000,
		httpOnly: true, signed:true}).send({ response_key : response_key, code : code ,notificationId : notificationId ,access_token: body?.access_token, body});
	});
});

async function authenticateUser(req, res, next) {
	const accessToken = req.cookies.accessToken;
	
	// jwt.verify(accessToken, JWT_AUTH_TOKEN, async (err, PhoneNumber) => {
	// 	if (PhoneNumber) {
	// 		req.PhoneNumber = PhoneNumber;
	// 		next();
	// 	} else if (err.message === 'TokenExpiredError') {
	// 		return res.status(403).send({
	// 			success: false,
	// 			msg: 'Access token expired'
	// 		});
	// 	} else {
	// 		console.log(err);
	// 		return res.status(403).send({ err, msg: 'User not authenticated' });
	// 	}
	// });
}


app.post('/api/ui/refresh', (req, res) => {
	const refreshToken = req.signedCookies.refreshToken;
	if (!refreshToken) return res.status(403).send({ message: 'Refresh token not found, login again' });
	console.log(req.tokenVerify)
	if(req.tokenVerify === "success")return res.status(200).send({ access_token : req.headers.token});
	// customer refresh token
	request.post({
		// url: process.env.AUTH_END_POINT+'/auth2/api/v1/authenticate/refresh-token',
		url: process.env.AUTH_END_POINT_NEW+'/api/auth/v1/stores/refresh-token',
		headers: {
			'content-type': 'application/json',
			'Authorization': "Bearer "+req.headers.token,
			'x-device-id': req.headers["x-device-id"],
			'x-store-id':''
		},
		json:{
			"refresh_token":refreshToken,
			"service": "CUSTOMER"
		}
	}, (err, httpResponse, body) => {
		if (err) return res.status(401).send({ message: 'User unathorized' });
		let message = httpResponse.statusCode === 200?{ access_token : body.access_token}:body;
		return res.status(httpResponse.statusCode).send(message);
	});
});

app.get('/health', (req, res) => {
	return res.status(200).send();
});

app.get('/api/ui/logout', (req, res) => {
	res
		.clearCookie('refreshToken')
		.clearCookie('accessToken')
		.clearCookie('authSession')
		.clearCookie('refreshTokenID')
		.send('logout');
});

// common refresh token api
app.get('/api/ui/refresh-token', (req, res) => {
	const refreshToken = req.signedCookies.refreshToken;
	console.log("========refreshToken==============")
	console.log("a4d935eb-22be-46a6-81b0-b2e32390706c refresh token, " + refreshToken)
	console.log("device id, " + req.headers["x-device-id"])
	console.log("x-timeZone, " + req.headers["x-timezone"])
	console.log("=========refreshToken=============")
	if (!refreshToken) return res.status(401).send({ message: 'User unathorized' });
	if (!req.headers.token) return res.status(401).send({ message: 'User unathorized' });
	if(req.tokenVerify === "success")return res.status(200).send({ access_token : req.headers.token});
	// anonymous refresh token
	console.log(req.headers)
	console.log(refreshToken)
	request.post({
		// url: process.env.AUTH_END_POINT+'/auth2/api/v1/refresh-token',
		url: process.env.AUTH_END_POINT_NEW+'/api/auth/v1/stores/refresh-token',
		headers: {
			'content-type': 'application/json',
			'Authorization': "Bearer " + req.headers.token,
			'x-device-id': req.headers["x-device-id"],
			'x-timezone': req.headers["x-timezone"],
			'x-store-id':''
		},
		json:{
			"refresh_token":refreshToken,
			"service":req.headers['service-type']
		}
	}, (err, httpResponse, body) => {
		if (err) return res.status(401).send({ message: 'User unathorized' });
		let message = httpResponse.statusCode === 200?{ access_token : body.access_token}:body;
		return res.status(httpResponse.statusCode).send(message);
	});
});

app.post('/api/ui/anonymous/login', (req, res) => {
		request.post({
			// url: process.env.AUTH_END_POINT+'/auth2/api/v1/authenticate/anonymous',
			url: process.env.AUTH_END_POINT_NEW+'/api/auth/v1/anonymous/authenticate',
			headers: {
				'content-type': 'application/json',
				'Authorization': process.env.CLIENT_SECRET_ID,
				'x-device-id': req.headers["x-device-id"],
				'x-timezone': req.headers["x-timezone"]
			}
		}, (err, httpResponse, body) => {
			let responseBody = JSON.parse(httpResponse.body)
			
			let message = httpResponse.statusCode === 200?{ access_token : responseBody.access_token}:responseBody;
			
			return res.status(httpResponse.statusCode).cookie("refreshToken", responseBody?.refresh_token,{"sameSite": 'strict',
			path: '/',
			sameSite: 'strict',
			// expires: new Date(new Date().getTime() + 100 * 1000),
			// maxAge:1000,
            httpOnly: true, signed:true}).send(message);
		});
});

app.post('/api/ui/PlaceOrder', (req, res) => {
	console.log(req.body)
	request.post({
		url: process.env.AUTH_END_POINT+'/order/api/v1/me/PlaceOrder',
		headers: {
			'content-type': 'application/json',
			'Authorization': "Bearer "+req.headers.authorization,
		},
		json:req.body
	}, (err, httpResponse, body) => {
		
		if (err) return res.status(401).send({ message: 'User unathorized' });
		console.log("err",httpResponse.statusCode)
		console.log("body",body)
		let message = httpResponse.statusCode === 200?body:body;
		return res.status(httpResponse.statusCode).send(message);
	});
});

async function verifyToken(req, res, next) {
	const accessToken = req.headers.token;
	const secret = Buffer.from(process.env.JWT_SECRET_KEY, "base64").toString();
	jwt.verify(accessToken, secret, async (err, PhoneNumber) => {
		if (PhoneNumber) {
			req.tokenVerify = "success";
			next();
		} else if (err.message === 'TokenExpiredError') {
			req.tokenVerify = "fail";
			next();
		} else {
			req.tokenVerify = "fail";
			next();
		}
	});
}
app.listen(process.env.PORT || 3000, ()=> {
	console.log('server running')
});
