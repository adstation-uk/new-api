import { IronSessionOptions } from "iron-session";

export interface SessionData {
  user?: {
    id: number;
    username: string;
    role: number;
  };
}

export const sessionOptions: IronSessionOptions = {
  password: "complex_password_at_least_32_characters_long",
  cookieName: "new_api_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60, // 30 days, match Go backend
  },
};
