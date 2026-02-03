/**
 * Middleware de restricción de roles
 */

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        code: 'ACCESS_DENIED',
        message: 'No tienes permiso para realizar esta acción'
      });
    }
    next();
  };
};

export default restrictTo;
