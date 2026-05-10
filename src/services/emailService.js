/*
  Minimal email service using Brevo (HTTP API).
  Uses global fetch available on Node >=18/22. Requires env:
    - BREVO_API_KEY
    - BREVO_SENDER_EMAIL
*/
import process from 'process';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'api-key': process.env.BREVO_API_KEY || ''
});

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.warn('Brevo API key or sender missing; skipping sendPasswordResetEmail');
    return null;
  }

  const payload = {
    sender: { email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: 'Recuperación de contraseña - Panadería',
    htmlContent: `<p>Solicitaste recuperar tu contraseña. Haz clic en el siguiente enlace para continuar:</p><p><a href="${resetLink}">${resetLink}</a></p><p>El enlace expira en 1 hora.</p>`
  };

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${text}`);
  }

  return res.json();
};

export const sendPasswordChangedEmail = async (toEmail) => {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.warn('Brevo API key or sender missing; skipping sendPasswordChangedEmail');
    return null;
  }

  const payload = {
    sender: { email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: 'Tu contraseña ha sido cambiada',
    htmlContent: `<p>Te notificamos que tu contraseña fue actualizada correctamente. Si no fuiste tú, contacta al soporte.</p>`
  };

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${text}`);
  }

  return res.json();
};

export default { sendPasswordResetEmail, sendPasswordChangedEmail };
