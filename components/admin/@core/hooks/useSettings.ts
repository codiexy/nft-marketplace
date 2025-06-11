import { useContext } from 'react'
import { SettingsContext, SettingsContextValue } from 'components/admin/@core/context/settingsContext'

export const useSettings = (): SettingsContextValue => useContext(SettingsContext)
