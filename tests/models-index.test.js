import { describe, expect, it } from 'vitest';
import * as models from '../src/models/index.js';

describe('Models Index', () => {
  it('debe exportar todos los modelos principales', () => {
    expect(models.Usuario).toBeDefined();
    expect(models.Producto).toBeDefined();
    expect(models.Carrito).toBeDefined();
    expect(models.Pedido).toBeDefined();
    expect(models.Configuracion).toBeDefined();
    expect(models.PasswordResetToken).toBeDefined();
  });
});
