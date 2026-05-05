import crypto from 'crypto';

export function generateToken(bytes: number) {
  const token = crypto.randomBytes(bytes).toString('hex');

  return token
}

export function generateHashedToken(token: string) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return hashedToken
}