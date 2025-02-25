import axios from "axios";
import { TokenData } from "./exchangeForToken";

type sessionTypes = {
  tokenData: TokenData;
  url: string;
};

export async function AddSession(Data: sessionTypes) {
  try {
    if (!Data.tokenData?.access_token) {
      throw new Error("Access token is missing!");
    }

    window.sessionStorage.setItem("OAuth_", JSON.stringify(Data.tokenData));

    const response = await axios.get(Data.url, {
      headers: {
        Authorization: `Bearer ${Data.tokenData.access_token}`,
      },
    });

    window.sessionStorage.setItem("User", JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    console.error("Failed to add session:", error);
    return null;
  }
}
