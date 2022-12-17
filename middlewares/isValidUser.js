import { failed_response } from "../helpers/response.js";
import { verifyAuthToken } from "../lib/auth.js";

export default function isValidUser(req, res, next) {
  const header = req.headers.authorization;
  const token = header.split("Bearer ")[1];

  if (!token) {
    return res.json(
      failed_response(401, "Please authenticate using valid token")
    );
  }

  try {
    const data = verifyAuthToken(token);
    req.user_id = data.id;
    req.role = data.role;

    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json(failed_response(403, "Forbidden"));
  }
}
