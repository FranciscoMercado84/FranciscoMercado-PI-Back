import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
  contactPhone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s\-()]{7,}$/, 'Número de teléfono inválido']
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  hours: {
    weekday: {
      morningOpen: {
        type: String,
        default: '07:00'
      },
      morningClose: {
        type: String,
        default: '14:30'
      },
      afternoonOpen: {
        type: String,
        default: '17:30'
      },
      afternoonClose: {
        type: String,
        default: '20:30'
      }
    },
    saturday: {
      open: {
        type: String,
        default: '07:00'
      },
      close: {
        type: String,
        default: '14:30'
      }
    },
    sunday: {
      open: {
        type: String,
        default: '07:00'
      },
      close: {
        type: String,
        default: '14:30'
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('Configuracion', configuracionSchema);
