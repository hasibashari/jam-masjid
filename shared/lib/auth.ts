import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Resolution: Environment -> Local File Query -> Random Gen + Log
function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  
  const secretPath = join(process.cwd(), 'session_secret.txt');
  if (existsSync(secretPath)) {
    try {
      return readFileSync(secretPath, 'utf-8').trim();
    } catch (e) {
      // Fallback
    }
  }

  // Generate ephemeral but persisted secret key
  const newSecret = randomBytes(32).toString('hex');
  try {
    writeFileSync(secretPath, newSecret, { mode: 0o600 }); // restrict read/write to owner
    console.warn("Generated a persistent session secret at ./session_secret.txt");
  } catch (e) {
    console.warn("Generating ephemeral session secret in memory. Instance-isolated!");
  }
  return newSecret;
}

const SESSION_SECRET = getSessionSecret();

/**
 * Hash a password using scrypt with a unique 16-byte random salt.
 * Output format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored scrypt hash using timingSafeEqual to prevent side-channel attacks.
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    
    const key = scryptSync(password, salt, 64).toString('hex');
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
  } catch (e) {
    return false;
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number; // expiry timestamp in milliseconds
}

/**
 * Sign a session payload using HMAC-SHA256.
 * Output format: base64Payload.signatureHex
 */
export function signSession(payload: SessionPayload): string {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64');
  
  const hmac = createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest('hex');
  
  return `${payloadB64}.${signature}`;
}

/**
 * Verify a signed session token. Returns the payload if valid, otherwise null.
 */
export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    
    // Validate signature first
    const hmac = createHmac('sha256', SESSION_SECRET);
    hmac.update(payloadB64);
    const expectedSignature = hmac.digest('hex');
    
    const signatureMatch = timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
    
    if (!signatureMatch) {
      return null;
    }
    
    // Parse payload and check expiration
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const payload: SessionPayload = JSON.parse(payloadStr);
    
    if (Date.now() > payload.exp) {
      return null; // Expired session
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}
