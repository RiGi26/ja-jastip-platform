import { RATES } from '@/constants/rates'

export interface CalcInput {
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  categorySurcharge: number
  serviceMultiplier: number
  isBranded: boolean
  isFragile: boolean
}

export interface CalcResult {
  basePrice: number
  volumePrice: number
  extraPrice: number
  insuranceHandling: number
  total: number
}

export function calculate(input: CalcInput): CalcResult {
  const volumeKg = (input.lengthCm * input.widthCm * input.heightCm) / RATES.VOLUME_DIVISOR

  const basePrice         = input.weightKg * RATES.BASE_PER_KG
  const volumePrice       = volumeKg * RATES.VOLUME_PER_KG
  const brandedFee        = input.isBranded ? RATES.BRANDED_FEE : 0
  const fragileFee        = input.isFragile ? RATES.FRAGILE_FEE : 0
  const extraPrice        = input.categorySurcharge + brandedFee + fragileFee
  const insuranceHandling = RATES.INSURANCE_HANDLING

  const subtotal = basePrice + volumePrice + extraPrice + insuranceHandling
  const total    = Math.round(subtotal * input.serviceMultiplier)

  return {
    basePrice:         Math.round(basePrice),
    volumePrice:       Math.round(volumePrice),
    extraPrice:        Math.round(extraPrice),
    insuranceHandling,
    total,
  }
}

export function formatRupiah(value: number): string {
  return 'Rp' + value.toLocaleString('id-ID')
}
