export function authorizeRole(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You are not allowed to perform this action.' });
    }

    next();
  };
}
