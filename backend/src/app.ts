import express from 'express';
import cors from "cors";
import cookieparser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (process.env.NODE_ENV === "production") {
      cb(new Error("No domain for production yet!"));
    }
    else if (origin === "http://athena.local:8080") {
      cb(null, true);
    }
    else {
      cb(new Error("CORS failure"));
    }
  }
}));
app.options('*', cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

import apiV1 from './routes';
app.use('/api/v1', apiV1);

export default app;
