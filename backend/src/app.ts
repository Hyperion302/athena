import express from 'express';
import cors from "cors";
import cookieparser from 'cookie-parser';
import logger from "@/logging";

const app = express();

const ORIGIN = process.env.ROOT_URL;

app.use(cors({
  origin: (testOrigin, cb) => {
    if (testOrigin === ORIGIN) {
      cb(null, true);
    }
    else if (testOrigin === undefined) {
      cb(null, true);
    }
    else {
      cb(new Error(`CORS failure, ${testOrigin} !== ${ORIGIN} nor is it undefined`));
    }
  }
}));
app.options('*', cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

import apiV1 from '@/routes';
app.use('/api/v1', apiV1);

export default app;
