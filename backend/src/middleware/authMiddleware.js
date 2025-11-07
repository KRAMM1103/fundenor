import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contiene userId y role
    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "No autorizado" });

    // Si `roles` es un solo string, conviértelo en arreglo
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};

