export const RATES = {
  BASE_PER_KG: 130_000,
  VOLUME_DIVISOR: 5_000,
  VOLUME_PER_KG: 50_000,
  INSURANCE_HANDLING: 65_000,

  CATEGORIES: [
    { label: 'Fashion Jepang',       surcharge: 0        },
    { label: 'Skincare Jepang',      surcharge: 30_000   },
    { label: 'Elektronik Jepang',    surcharge: 45_000   },
    { label: 'Luxury Brand',         surcharge: 85_000   },
    { label: 'Snack / Makanan',      surcharge: 25_000   },
    { label: 'Figure / Anime Goods', surcharge: 40_000   },
  ],

  SERVICES: [
    { label: 'Regular Cargo Jepang',   multiplier: 1.0 },
    { label: 'Express Air Cargo',      multiplier: 1.3 },
    { label: 'Priority Branded Cargo', multiplier: 1.6 },
  ],

  BRANDED_FEE:  80_000,
  FRAGILE_FEE:  35_000,

  DELIVERY_DAYS: '5–9 Hari',
  SUCCESS_RATE:  '99.4%',
}
