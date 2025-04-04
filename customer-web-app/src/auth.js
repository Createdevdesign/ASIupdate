import axios from 'axios';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

axios.defaults.withCredentials = true;
class Auth {
	constructor() {
		this.authenticated = false;
	}

	isAuthenticated() {
		const accessToken = cookies.get('authSession');
		const refreshToken = cookies.get('refreshTokenID');
		if (!accessToken && !refreshToken) {
			return (this.authenticated = false);
		}
		if (accessToken && refreshToken) {
			return (this.authenticated = true);
		}
		if (!accessToken && refreshToken) {
			axios
				.post(process.env.REACT_APP_UI_API_ENDPOINT + '/api/ui/refresh', {
					withCredentials: true
				})
				.then(function(res) {
					console.log(res.data);
					
					window.location.reload();
				})
				.catch(function(error) {
					console.log("refresh token error", err)
					console.log(error.response);
				});
		}
	}
}

export default new Auth();
