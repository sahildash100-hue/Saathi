declare module 'express-session' {
  interface SessionData {
    userId?: string;
    phoneNumber?: string;
  }
}

export {};

