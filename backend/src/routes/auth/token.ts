import { Request, Response } from "express";
import axios from "axios";
import logger from "@/logging";
import qs from "qs";

const TOKEN_URL = "https://discordapp.com/api/oauth2/token";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OAUTH_REDIRECT = `${process.env.ROOT_URL}/authRedirect`;

export default async function (req: Request, res: Response) {
  if (!req.body.code) {
    logger.warn("No code provided");
    res.sendStatus(400);
    return;
  }
  try {
    const response = await axios({
      method: "post",
      url: TOKEN_URL,
      data: qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.body.code,
        redirect_uri: OAUTH_REDIRECT,
        scope: "identify guilds",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    res.status(200).send(response.data);
  } catch (e) {
    logger.warn(`Error encountered while forging access token:`, e);
    res.sendStatus(500);
  }
}
