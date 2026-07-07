const UNIT_LABELS = { PIECE: 'pcs', GRAM: 'g', KG: 'kg', ML: 'ml', LITRE: 'L' }

export function useUnitLabel() {
  function unitShortLabel(item) {
    if (!item?.unitType) return ''
    return item.unitType === 'CUSTOM' ? (item.customUnitLabel || 'unit') : UNIT_LABELS[item.unitType]
  }
  return { unitShortLabel }
}
