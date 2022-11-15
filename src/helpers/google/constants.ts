import { values } from 'lodash/fp'

// Google Sheets uses a color value range of [0,1].
// all traditional RGB values must be divided by 255
const convertColor = (val: number): number => Number((val / 255).toFixed(6))

const convertRGB = ({ r, g, b }: { r: number; g: number; b: number }) => ({
  red: convertColor(r),
  green: convertColor(g),
  blue: convertColor(b),
})

interface IRGB_Color {
  red: number
  green: number
  blue: number
}

const TAB_COLORS: Record<string, IRGB_Color> = {
  black: convertRGB({ r: 0, g: 0, b: 0 }),
  darkRedBerry: convertRGB({ r: 166, g: 29, b: 2 }),
  darkRed: convertRGB({ r: 204, g: 2, b: 2 }),
  darkOrange: convertRGB({ r: 230, g: 145, b: 56 }),
  darkYellow: convertRGB({ r: 242, g: 194, b: 49 }),
  darkGreen: convertRGB({ r: 106, g: 167, b: 79 }),
  darkCyan: convertRGB({ r: 70, g: 130, b: 141 }),
  darkCornflowerBlue: convertRGB({ r: 59, g: 121, b: 215 }),
  darkBlue: convertRGB({ r: 62, g: 133, b: 198 }),
  darkPurple: convertRGB({ r: 103, g: 79, b: 167 }),
  darkMagenta: convertRGB({ r: 166, g: 77, b: 120 }),
} as const

const _TAB_COLORS = values(TAB_COLORS)
type TTabColor = typeof _TAB_COLORS[number]

export { _TAB_COLORS, convertColor, TAB_COLORS }
export type { TTabColor }
