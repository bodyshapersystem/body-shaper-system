import "server-only";
import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Body Shaper System Hub";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export async function generateTotpQrCodeDataUrl(email: string, secret: string): Promise<string> {
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    return authenticator.check(code.trim(), secret);
  } catch {
    return false;
  }
}
