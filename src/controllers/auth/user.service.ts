import qs from "qs";
import { omit } from "lodash";
import dotenv from "dotenv";
import * as argon2 from "argon2";
import { User } from "@prisma/client";
import { prisma } from "../../libs/db";
import { GoogleAccountUser, GoogleReturnedToken } from "../../types";
import axios from "axios";
dotenv.config();

export const createUser = async (
  fields: Omit<User, "createdAt" | "updatedAt">
) => {
  const { password, ...rest } = fields;
  try {
    const hashedPassword = await argon2.hash(password);

    const user: User = await prisma.user.create({
      data: {
        password: hashedPassword,
        ...rest,
      },
    });
    return omit(user, "password");
  } catch (err: any) {
    throw new Error(err);
  }
};

export async function verifyPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  const isMatch = await argon2.verify(user.password, password);

  if (!user || !isMatch) return false;

  return omit(user, "password");
}

//  Login
export const loginUser = async (fields: Pick<User, "email" | "password">) => {
  try {
    const user = await verifyPassword({ ...fields });
    return user;
  } catch (err: any) {
    throw new Error(err);
  }
};

export async function getGoogleOAuthTokens({
  code,
}: {
  code: string;
}): Promise<GoogleReturnedToken> {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post<GoogleReturnedToken>(
      url,
      qs.stringify(values),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(error.response.data.error);
    throw new Error(error.message);
  }
}

/* here: 
      get the user from the oauth2
      using token id and access token
  */

export const getGoogleAccountUser = async (
  id_token: string,
  access_token: string
): Promise<GoogleAccountUser> => {
  try {
    const res = await axios.get<GoogleAccountUser>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
