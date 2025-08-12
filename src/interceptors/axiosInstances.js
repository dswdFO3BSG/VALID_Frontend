import axios from 'axios';
import Cookies from 'js-cookie';
import setupAuthInterceptor from '../interceptors/authInterceptor';
import setupPSAInterceptor from '../interceptors/psaInterceptors.js';

// for local
const authAxiosInstance = axios.create();
setupAuthInterceptor(authAxiosInstance, Cookies.get('token'));

// for PSA
const psaAxiosInstance = axios.create();
setupPSAInterceptor(psaAxiosInstance, Cookies.get('psa-token'));

export { authAxiosInstance, psaAxiosInstance };
