// ** React Imports
import { ReactNode } from 'react'
import { ThemeColor } from '../../layouts/types'

export type CardStatsVerticalProps = {
  title: string
  stats: string
  icon: ReactNode
  subtitle: string
  color?: ThemeColor
  trendNumber: string
  trend?: 'positive' | 'negative'
}
