import { Request, Response } from 'express';
import axios from 'axios';
import qs from 'qs';
import logger from '../../logging';

const TOKEN_URL = 'https://discordapp.com/api/oauth2/token';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export default async function (req: Request, res: Response) {
  if (!req.body.token) {
    logger.warn('Missing refresh token');
    res.sendStatus(400);
    return;
  }
  try {
    const response = await axios({
      method: 'post',
      url: TOKEN_URL,
      data: qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: req.body.refresh_token,
        redirect_uri: 'http://drkt.local:8080/authRedirect',
        scope: 'identify guilds',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.status(200).send(response.data);
  } catch (e) {
    logger.warn(`Error encountered while refresh token:`, e);
    res.sendStatus(500);
  }
}
