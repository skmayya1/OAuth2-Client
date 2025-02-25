type generateAuthUrlType = {
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  url: string;
  state: string;
};

export function generateAuthUrl(Config: generateAuthUrlType): string {
  const url = new URL(Config.url);

const params = new URLSearchParams({
  response_type: "code",
  client_id: Config.client_id,
  redirect_uri: Config.redirect_uri,
  scope: ["openid", "profile", "email"].join(" "),
  state: Config.state,
  code_challenge: Config.code_challenge,
  code_challenge_method: "S256",
});


  return `${url}?${params.toString()}`;
}
