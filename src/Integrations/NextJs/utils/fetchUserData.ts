import axios from "axios";
import { GitHubResponse } from "types/github";

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export async function FetchUserData({access_token}: {access_token: string}) {
  const headers = {
    "Content-Type": "application/json",
      Accept: "application/json", 
      Authorization: `Bearer ${access_token}`
  };
    const response = await axios.get("https://api.github.com/user", {
        headers,
    });
    const Profile: GitHubResponse = await response.data;

    if (!Profile.email) { 
        const emailResponse = await axios.get("https://api.github.com/user/emails", {
            headers,
        });
        const emails: GitHubEmail[] = await emailResponse.data;
        const primaryEmail = getPrimaryVerifiedEmail(emails);
        if (primaryEmail) {
            Profile.email = primaryEmail.email;
        }
    }
    
    return {
        user: {
            id: Profile.id.toString(),
            email: Profile.email,
            name: Profile.name || Profile.login,
            avatar: Profile.avatar_url,
            username: Profile.login,
            provider: "github",
        }
    }

}

function getPrimaryVerifiedEmail(emails: GitHubEmail[]): { email: string; verified: boolean } | null {
  const primaryEmail = emails.find(email => email.primary && email.verified);
  return primaryEmail ? { email: primaryEmail.email, verified: primaryEmail.verified } : null;
}