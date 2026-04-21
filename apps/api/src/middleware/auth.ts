import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config.js";

type AuthPayload = {
  sub: string;
  role: Role;
  name: string;
};

export const createToken = (payload: AuthPayload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = {
      id: payload.sub,
      role: payload.role,
      name: payload.name,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const requireRole = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action." });
  }

  return next();
};

export const ensureOwnershipOrAdmin = (ownerId: string, user?: Express.User) =>
  Boolean(user && (user.role === Role.ADMIN || user.id === ownerId));
