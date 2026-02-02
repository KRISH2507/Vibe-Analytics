export function requirePro(req: any, res: any, next: any) {
  if (req.user.plan !== "pro") {
    return res.status(403).json({
      message: "Pro plan required",
    });
  }
  next();
}
