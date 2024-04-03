export interface IJwtAuthService {
  sign(payload: object): Promise<string>;
  verify(token: string): Promise<any>;
}
