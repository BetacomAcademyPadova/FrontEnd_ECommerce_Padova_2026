export interface LoginReq{
  username: string;
  password: string;
}

export interface LoginDTO {
  token: string;
  user: UserDTO;
}

export interface UserDTO {
  userId:string,
  ruolo:string,
  mailValidate:string,
  carrelloSize:number,
  username:string
}

export interface ForgotPasswordReq {
    email: string;
}

export interface ResetPasswordReq {
    token: string;
    password: string;
}