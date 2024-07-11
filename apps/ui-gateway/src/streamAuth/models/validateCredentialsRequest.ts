export interface ValidateCredentialsRequest {
  username: string;
  password: string;
  token: string;
  type: string;
  streamID: string;
}
