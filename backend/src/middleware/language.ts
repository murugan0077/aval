import { Request, Response, NextFunction } from 'express';

const SUPPORTED_LANGS = ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn'];

declare global {
  namespace Express {
    interface Request {
      lang?: string;
    }
  }
}

export const languageDetect = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers['accept-language'] || 'en';
  const preferred = header.split(',')[0].substring(0, 2);
  req.lang = SUPPORTED_LANGS.includes(preferred) ? preferred : 'en';
  next();
};
