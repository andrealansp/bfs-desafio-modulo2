import express from 'express';
import winston from 'winston';
import { promises as fs } from 'fs';
import gradesRoutes from './routes/grades.js';

const app = express();
app.use(express.json());

global.fileName = './grades.json';

//Setup an instance of logger.
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.use('/grades', gradesRoutes);

// Initiate the server.
app.listen(3000, async () => {
  logger.info('Api Started');
});
