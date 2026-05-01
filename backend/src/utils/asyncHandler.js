export function asyncHandler(fn) {
  return async function wrappedHandler(req, res, next) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
