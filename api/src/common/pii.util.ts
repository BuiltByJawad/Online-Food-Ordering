export function maskEmail(email?: string | null): string | null {
  if (!email) return null;
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const maskedUser = user.length <= 2 ? `${user[0] ?? '*'}*` : `${user[0]}***${user[user.length - 1]}`;
  return `${maskedUser}@${domain}`;
}

export function maskPhone(phone?: string | null): string | null {
  if (!phone) return null;
  if (phone.length <= 4) return '***';
  const last4 = phone.slice(-4);
  return `***-***-${last4}`;
}
