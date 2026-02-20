import crypto from 'crypto';

const SECRET = process.env.ADMIN_KEY;
if (!SECRET) {
  console.warn('[安全警告] 未设置 ADMIN_KEY 环境变量，管理员功能已禁用');
}

/**
 * 生成 HMAC 签名的 session token
 * 格式: timestamp.signature
 */
export function generateToken(): string {
  if (!SECRET) throw new Error('ADMIN_KEY 未配置');
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * 验证 token 有效性
 * @param maxAgeMs token 最大有效时间（默认 7 天）
 */
export function verifyToken(token: string, maxAgeMs = 7 * 24 * 60 * 60 * 1000): boolean {
  if (!SECRET) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const ts = Number(timestamp);
  if (isNaN(ts)) return false;

  // 检查过期
  if (Date.now() - ts > maxAgeMs) return false;

  // 验证签名
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(timestamp)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
