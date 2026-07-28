const BASE_STYLE_DATA_ATTRIBUTE = 'data-attribute-title-base-style'

export function applyAttributeTitleStyle (rootElement, titleStyle) {
  if (!rootElement) {
    return
  }

  const style = String(titleStyle || '').trim()
  for (const label of rootElement.querySelectorAll('.v-label, label')) {
    const baseStyle = label.getAttribute(BASE_STYLE_DATA_ATTRIBUTE)
    const originalStyle = baseStyle === null ? (label.getAttribute('style') || '') : baseStyle

    if (baseStyle === null) {
      label.setAttribute(BASE_STYLE_DATA_ATTRIBUTE, originalStyle)
    }

    if (style) {
      label.setAttribute('style', `${originalStyle}; ${style}`)
    } else if (originalStyle) {
      label.setAttribute('style', originalStyle)
    } else {
      label.removeAttribute('style')
    }
  }
}
