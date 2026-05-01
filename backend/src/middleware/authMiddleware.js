import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/auth.js";

export function requireAuth(allowedRoles = []) {
  return function authMiddleware(req, _res, next) {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return next(new ApiError(401, "Authentication required."));
    }

    try {
      const payload = verifyToken(token);

      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return next(new ApiError(403, "You do not have access to this action."));
      }

      req.user = payload;
      next();
    } catch (_error) {
      next(new ApiError(401, "Session expired. Please log in again."));
    }
  };
}
