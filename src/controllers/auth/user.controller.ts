import {
  createSession,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "./session.service";
import {
  createUser,
  getGoogleAccountUser,
  getGoogleOAuthTokens,
  loginUser,
} from "./user.service";
import { signJwt } from "../../utils/jwt";
import { Request, Response } from "express";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    return res.json(user);
  } catch (err: any) {
    // console.log(err);
    return res.status(500).json(err.message);
  }
};

// get the current user
export async function getCurrentUser(req: Request, res: Response) {
  return res.send(res.locals.user);
}

// google auth controller
export const googleOauthController = async (req: Request, res: Response) => {
  const code = req.query.code as string; // code from qs
  try {
    // using code, get the access Token and id
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });

    const googleAccountUser = await getGoogleAccountUser(
      id_token,
      access_token
    );
    if (!googleAccountUser.verified_email) {
      return res.status(403).json("Unverify google account");
    }

    // Upsert the user document
    const user = await prisma.user.upsert({
      where: {
        email: googleAccountUser.email,
      },
      update: {
        email: googleAccountUser.email,
        name: googleAccountUser.name,
        imageUrl: googleAccountUser.picture,
      },
      create: {
        email: googleAccountUser.email,
        name: googleAccountUser.name,
        imageUrl: googleAccountUser.picture,
      },
    });

    // create a session for user
    const session = await createSession(user.id, req.get("user-agent") || "");

    // create an access token
    const accessToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.ACCESS_TOKEN_TIME } // 15 minutes
    );

    // create a refresh token
    const refreshToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.REFRESH_TOKEN_TIME } // 1 year
    );

    // set cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.redirect(process.env.CLIENT_ORIGIN);
  } catch (error) {
    // console.log(error, "Failed to authorize Google user");
    return res.redirect(`${process.env.CLIENT_ORIGIN}/oauth/error`);
  }
};

// email password login
export const loginWithEmailAndPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await loginUser(req.body);
    if (!user) {
      throw new Error(
        "Invalid Credentials! Please check your email and password"
      );
    }
    const session = await createSession(user.id, req.get("user-agent") || "");

    // create an access token
    const accessToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.ACCESS_TOKEN_TIME } // 15 minutes
    );

    // create a refresh token
    const refreshToken = signJwt(
      { ...user, session: session.id },
      { expiresIn: process.env.REFRESH_TOKEN_TIME } // 1 year
    );

    // set cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.redirect(process.env.CLIENT_ORIGIN);
  } catch (err) {
    return res.status(401).json(err.message);
  }
};
