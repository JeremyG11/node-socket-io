import { get, omit } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { reIssueAccessToken } from "../controllers/auth/session.service";

/*
    With the cookies access and refresh tokens, decode the user 
    and get the session id and
   */

export const withUseDeserializer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken =
    get(req, "cookies.accessToken") ||
    get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

  const refreshToken =
    get(req, "cookies.refreshToken") || get(req, "headers.x-refresh");

  //  No Token, just proceed
  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken);
  //  Assign res.locals.user to the decoded info from the token
  if (decoded) {
    res.locals.user = omit(decoded as object, "password");
    return next();
  }

  /*
    get new accecss token the in case the current token
    expired given that the refresh token exist

   */

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);

      res.cookie("accessToken", newAccessToken, {
        maxAge: 900000, // 15 mins
        httpOnly: true,
        domain: "localhost",
        path: "/",
        sameSite: "strict",
        secure: false,
      });
    }

    const result = verifyJwt(newAccessToken as string);

    res.locals.user = result.decoded;
    return next();
  }

  return next();
};
