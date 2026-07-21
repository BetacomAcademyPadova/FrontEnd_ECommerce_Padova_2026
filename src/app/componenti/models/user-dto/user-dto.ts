export interface LoginReq{
  username: string;
  password: string;
}

export interface LoginDTO {
  accessToken:string;
  user: UserDTO;
}

export interface UserDTO {
  userId:string,
  ruolo:string,
  mailValidate:string,
  carrelloSize:number
}