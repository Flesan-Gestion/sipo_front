import axios from "axios";
import { useSecurityStore } from "../store/security";
import { useGlobalStore } from "../store/global";

axios.interceptors.request.use(
	function (config) {
		const security = useSecurityStore()
		const token = security.token
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config
	},
	function (error) {
		return Promise.reject(error)
	}
)

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		const security = useSecurityStore();
		const global = useGlobalStore();
		global.utl.hiddenLoader();
		const responseData = error?.response?.data;
		const responseStatus = responseData?.status;
		if (responseData == null || typeof responseData !== "object" ||
			responseStatus == global.statusCodes.INTERNAL_SERVER_ERROR) {
			global.utl.genToast(global.tstType.SERVER_ERROR);
			return Promise.reject(error);
		}
		if ([global.statusCodes.UNAUTHORIZED].includes(responseStatus)) {
			security.clear();
			global.utl.genToast(global.tstType.CORRUPTED_SESSION);
			global.utl.navigate('Auth');
		}
		return error.response;
	}
);
