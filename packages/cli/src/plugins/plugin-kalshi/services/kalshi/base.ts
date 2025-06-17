import * as fs from "fs";
import * as crypto from "crypto";
import { z } from "zod";

// Zod schemas for validation
const HeadersSchema = z.record(z.string(), z.string());

// Type inference from schemas
type Headers = z.infer<typeof HeadersSchema>;

const keyPath = process.env.KALSHI_PRIVATE_KEY_PATH;

const loadPrivateKeyFromFile = (): crypto.KeyObject => {
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Private key file not found: ${keyPath}`);
  }

  const keyData: string = fs.readFileSync(keyPath, "utf8");
  const privateKey: crypto.KeyObject = crypto.createPrivateKey({
    key: keyData,
    format: "pem",
    // If your key is encrypted, you'd need to provide a passphrase here
    // passphrase: 'your-passphrase'
  });
  return privateKey;
};

const signPssText = (privateKey: crypto.KeyObject, text: string): string => {
  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error("Text to sign cannot be empty");
  }

  // Before signing, we need to hash our message.
  // The hash is what we actually sign.
  // Convert the text to bytes
  const message: Buffer = Buffer.from(text, "utf-8");

  try {
    const signature: Buffer = crypto.sign("sha256", message, {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });
    return signature.toString("base64");
  } catch (error) {
    throw new Error(`RSA sign PSS failed: ${(error as Error).message}`);
  }
};

export const buildHeaders = (method: string, path: string) => {
  // Get the current time
  const currentTime: Date = new Date();
  const currentTimeMilliseconds: number = currentTime.getTime();
  const timestampStr: string = currentTimeMilliseconds.toString();

  // Load the RSA private key
  const privateKey: crypto.KeyObject = loadPrivateKeyFromFile();

  const msgString: string = timestampStr + method + path;
  console.log("Message to sign:", msgString);

  const sig: string = signPssText(privateKey, msgString);

  const headers: Headers = {
    "KALSHI-ACCESS-KEY": process.env.KALSHI_API_KEY,
    "KALSHI-ACCESS-SIGNATURE": sig,
    "KALSHI-ACCESS-TIMESTAMP": timestampStr,
    "Content-Type": "application/json",
  };

  // Validate headers
  HeadersSchema.parse(headers);

  return headers;
};
