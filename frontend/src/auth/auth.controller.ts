export async function getMe(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  // TEMP: token = email (for now)
  const user = await findUserByEmail(token);

  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: "free",
    createdAt: user.created_at,
  });
}
