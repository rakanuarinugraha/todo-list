import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

// export const authenticate = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     res.status(401).json({ message: "Unauthorized" });
//     return;
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       userId: string;
//     };
//     req.userId = decoded.userId;
//     next();
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// New Code
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authorization header missing or malformed", data: null });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token || token.trim() === "") {
    res.status(401).json({ success: false, message: "Token is missing", data: null });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: "Token has expired", data: null });
      return;
    }
    res.status(401).json({ success: false, message: "Invalid token", data: null });
  }
};