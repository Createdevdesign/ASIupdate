export interface CreateAuthClientDto {
    ClientId: string;
    ClientSecret: string;
    AccessTokenValidity: number;
    RefreshTokenValidity: number;
    Active: Boolean;
    TempTokenValidity:number;
    TokenValidity:number;
}
