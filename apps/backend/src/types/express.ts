type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
