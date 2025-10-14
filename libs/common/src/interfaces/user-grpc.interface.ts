export const USER_PACKAGE_NAME = 'user';
export const USER_SERVICE_NAME = 'UserService';
export const AUTH_SERVICE_NAME = 'AuthService';
export interface IGoogleLoginRequest {
    code: string;
}
export interface IGoogleLoginResponse {
    message: string;
}
export interface IAuthService {
    googleLogin(request: IGoogleLoginRequest): IGoogleLoginResponse;
}