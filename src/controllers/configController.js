/**
 * Controlador de Configuración - Maneja la configuración general de la aplicación
 */

import { Configuracion } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /v1/configuracion-general
 * Obtener configuración general de la aplicación
 */
export const getConfiguration = asyncHandler(async (req, res) => {
  let config = await Configuracion.findOne();

  // Si no existe, crear la configuración por defecto
  if (!config) {
    config = await Configuracion.create({
      contactPhone: '+34 911 284 763',
      contactEmail: 'admin@panaderia.com',
      hours: {
        weekday: {
          morningOpen: '07:00',
          morningClose: '14:30',
          afternoonOpen: '17:30',
          afternoonClose: '20:30'
        },
        saturday: {
          open: '07:00',
          close: '14:30'
        },
        sunday: {
          open: '07:00',
          close: '14:30'
        }
      }
    });
  }

  res.json({ data: config });
});

/**
 * PUT /v1/configuracion-general
 * Actualizar configuración general (solo admin)
 */
export const updateConfiguration = asyncHandler(async (req, res) => {
  let config = await Configuracion.findOne();

  // Si no existe, crear la configuración
  if (!config) {
    config = await Configuracion.create(req.body);
  } else {
    // Actualizar campos permitidos
    const { contactPhone, contactEmail, hours } = req.body;
    if (contactPhone) config.contactPhone = contactPhone;
    if (contactEmail) config.contactEmail = contactEmail;
    if (hours) {
      config.hours = { ...config.hours.toObject(), ...hours };
    }
    await config.save();
  }

  res.json({ data: config });
});

export default {
  getConfiguration,
  updateConfiguration
};
