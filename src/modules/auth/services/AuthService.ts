import axios from "axios";
import { ApiResponse } from "../../../shared/interfaces/api-response.interface";

export class AuthService {

    private static url = import.meta.env.APP_API_URL;

    static async googleLogin(credential: string): Promise<ApiResponse<string>> {
        const response = await axios.post(`${AuthService.url}/auth/google/`, {
            credential,
        });
        return response.data;
    }

    static async googleLoginWithAccessToken(accessToken: string): Promise<ApiResponse<string>> {
        const response = await axios.post(`${AuthService.url}/auth/google/`, {
            access_token: accessToken,
        });
        return response.data;
    }

    static async verify(accessToken: string): Promise<ApiResponse<string>> {
        const response = await axios.post(`${AuthService.url}/auth/verify/`, {
            access_token: accessToken
        });
        return response.data;
    }

    static async extendSession(): Promise<ApiResponse<string>> {
        const response = await axios.post(`${AuthService.url}/auth/extendSession/`, null);
        return response.data;
    }
}
