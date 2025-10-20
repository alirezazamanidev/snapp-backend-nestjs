import { Observable } from 'rxjs';

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
  role: string;
}
export interface IInvalidateSessionRequest {
  sessionId: string;
}
export interface IInvalidateSessionResponse {
  message: string;
}
export interface IInvalidateAllSessionsRequest {
  userId: string;
}
export interface IInvalidateAllSessionsResponse {
  message: string;
}
export interface IAuthService {
  googleLogin(request: IGoogleLoginRequest): Observable<IGoogleLoginResponse>;
  validateSession(
    request: IValidateSessionRequest,
  ): Observable<IValidateSessionResponse>;
  invalidateSession(
    request: IInvalidateSessionRequest,
  ): Observable<IInvalidateSessionResponse>;
  invalidateAllSessions(
    request: IInvalidateAllSessionsRequest,
  ): Observable<IInvalidateAllSessionsResponse>;
}
export interface IUpdateUserRoleRequest {
  sessionId: string;
  role: string;
}
export interface IUpdateUserRoleResponse {
  message: string;
}
export interface ICreateOrUpdateDriverProfileRequest {
  userId: string;

  carPlateNumber: string;
  carModel: string;
  carColor: string;
}
export interface ICreateOrUpdateDriverProfileResponse {
  message: string;
}
export interface IGetProfileRequest {
  userId: string;
}
export interface IGetProfileResponse {
  id: string;
  fullname: string;
  email: string;
  avatarUrl: string;
}
export interface ICheckDriverProfileRequest {
  userId: string;
}
export interface ICheckDriverProfileResponse {
  hasProfile: boolean;
}
export interface IGetRoleRequest {
  userId: string;
}
export interface IGetRoleResponse {
  role: string;
}
export interface IUserService {
  getRole(request: IGetRoleRequest): Observable<IGetRoleResponse>;
  getProfile(request: IGetProfileRequest): Observable<IGetProfileResponse>;
  updateUserRole(
    request: IUpdateUserRoleRequest,
  ): Promise<IUpdateUserRoleResponse>;
  createOrUpdateDriverProfile(
    request: ICreateOrUpdateDriverProfileRequest,
  ): Promise<ICreateOrUpdateDriverProfileResponse>;
  checkDriverProfile(
    request: ICheckDriverProfileRequest,
  ): Observable<ICheckDriverProfileResponse>;
}
