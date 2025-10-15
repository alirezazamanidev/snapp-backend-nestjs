declare namespace Express {
    interface Request {
      user: {
        userId: string;
        sessionId: string;
      }
    }
  }