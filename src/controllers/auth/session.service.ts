import { update } from "lodash";
import { signJwt } from "../../utils/jwt";
import { verifyPassword } from "./user.service";
import { CookieOptions, Request, Response } from "express";

export async function createSession(userId: string, userAgent: string) {
  const session = await prisma.session.upsert({
    where: {
      userId,
      userAgent,
    },
    update: {
      userId,
      userAgent,
    },
    create: {
      userId,
      userAgent,
    },
  });

  return session;
}

export const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  httpOnly: true,
  domain: "localhost",
  path: "/",
  sameSite: "lax",
  secure: false,
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10, // 1 year
};

export async function createUserSessionController(req: Request, res: Response) {
  // Validate the user's password
  const user = await verifyPassword(req.body);

  if (!user) {
    return res.status(401).send("Invalid email or password");
  }

  // create a session
  const session = await createSession(user.id, req.get("user-agent") || "");

  // create an access token with jwt
  const accessToken = signJwt(
    { ...user, session: session.id },
    { expiresIn: process.env.ACCESS_TOKEN_TIME } // 15 minutes
  );

  // create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session.id },
    { expiresIn: process.env.REFRESH_TOKEN_TIME } // 15 minutes
  );

  // return access & refresh tokens
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  return res.send({ accessToken, refreshToken });
}

export async function getUserSessions(req: Request, res: Response) {
  const userId = res.locals.user.id;

  const sessions = await prisma.session.findFirst({
    where: { userId: userId, valid: true },
  });

  return res.send(sessions);
}

// delete session
export async function deleteSession(req: Request, res: Response) {
  const sessionId = res.locals.user.session;
  try {
    await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        valid: false,
      },
    });

    return res.send({
      accessToken: null,
      refreshToken: null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
}
