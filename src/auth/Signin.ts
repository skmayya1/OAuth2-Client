
export const signin = async () => {
  const url = process.env.NEXT_PUBLIC_URL;
  window.location.href = url + "/api/auth/signin";
};
