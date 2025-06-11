// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import VerticalLayout from 'components/admin/@core/layouts/VerticalLayout'

// ** Navigation Imports
import VerticalNavItems from 'components/admin/navigation/vertical'

// ** Component Import
import UpgradeToProButton from './components/UpgradeToProButton'
import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'components/admin/@core/hooks/useSettings'

interface Props {
  children: ReactNode
}

const UserLayout = ({ children }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings();

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

 

  return (
    <VerticalLayout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      verticalNavItems={VerticalNavItems()} // Navigation Items
      // afterVerticalNavMenuContent={UpgradeToProImg}
      verticalAppBarContent={(
        props // AppBar Content
      ) => (
        <VerticalAppBarContent
          hidden={hidden}
          settings={settings}
          saveSettings={saveSettings}
          toggleNavVisibility={props.toggleNavVisibility}
        />
      )}
    >
      {children}
      <UpgradeToProButton />
    </VerticalLayout>
  )
}

export default UserLayout
