export const USER_PACKAGE_NAME = 'user';
export const USER_SERVICE_NAME = 'UserService';
export const AUTH_SERVICE_NAME = 'AuthService';
export class ITestRequest {
    name: string;
}
export class ITestResponse {
    message: string;
}
export interface IAuthService {
    test(request: ITestRequest): ITestResponse;
}