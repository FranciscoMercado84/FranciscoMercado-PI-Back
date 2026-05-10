import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Email Service', () => {
  const originalEnv = { ...process.env };
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  it('debe omitir el envío si faltan variables de entorno', async () => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SENDER_EMAIL;

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { sendPasswordResetEmail, sendPasswordChangedEmail } = await import('../src/services/emailService.js');

    await expect(sendPasswordResetEmail('test@test.com', 'https://example.com/reset/1')).resolves.toBeNull();
    await expect(sendPasswordChangedEmail('test@test.com')).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('debe enviar email de recuperación con payload correcto', async () => {
    process.env.BREVO_API_KEY = 'test-key';
    process.env.BREVO_SENDER_EMAIL = 'sender@test.com';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: '1' })
    });

    const { sendPasswordResetEmail } = await import('../src/services/emailService.js');
    const result = await sendPasswordResetEmail('user@test.com', 'https://frontend/reset/token');

    expect(result).toEqual({ messageId: '1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['api-key']).toBe('test-key');
    const body = JSON.parse(options.body);
    expect(body.sender.email).toBe('sender@test.com');
    expect(body.to[0].email).toBe('user@test.com');
  });

  it('debe fallar si Brevo responde con error', async () => {
    process.env.BREVO_API_KEY = 'test-key';
    process.env.BREVO_SENDER_EMAIL = 'sender@test.com';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom'
    });

    const { sendPasswordChangedEmail } = await import('../src/services/emailService.js');

    await expect(sendPasswordChangedEmail('user@test.com')).rejects.toThrow('Brevo send failed: 500 boom');
  });
});
