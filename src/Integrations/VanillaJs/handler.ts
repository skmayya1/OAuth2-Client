import { createGitHubAuthUrl } from "../../Oauth2/create-authorization-url";

export class OAuth2Client {
    clientId: string;
    redirectUri: string;

    constructor(config: OAuth2Config) {
        this.clientId = config.clientId;
        this.redirectUri = config.redirectUri;
    }
    
    static generateAuthUrl(config: OAuth2Config) { 
        const { clientId, redirectUri } = config;
        const url = createGitHubAuthUrl({ clientId, redirectUri,clientSecret: null });
        return url;
    }
}

interface OAuth2Config { 
    clientId: string;
    redirectUri: string;
}