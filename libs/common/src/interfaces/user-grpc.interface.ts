import { Observable } from "rxjs";

export const USER_PACKAGE_NAME = 'user';
export const USER_SERVICE_NAME = 'UserService';
export const AUTH_SERVICE_NAME = 'AuthService';
export interface IGoogleLoginRequest {
    code: string;
    ipAddress: string;
    userAgent: string;
}
export interface IGoogleLoginResponse {
    message: string;
    sessionId: string;
}
export interface IValidateSessionRequest {
    sessionId: string;  
}
export interface IValidateSessionResponse {
    userId: string;
    sessionId: string;
}
export interface IAuthService {
    googleLogin(request: IGoogleLoginRequest): Observable<IGoogleLoginResponse>;
    validateSession(request: IValidateSessionRequest): Observable<IValidateSessionResponse>;
}