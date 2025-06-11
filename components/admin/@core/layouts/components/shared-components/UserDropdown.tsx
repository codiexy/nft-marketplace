
import { useState, SyntheticEvent, Fragment } from 'react'
import { useRouter } from 'next/router'

import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
import SettingsIcon from '@mui/icons-material/Settings';
import { Metamask } from 'context'

// ** Styled Components

const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const { logout, user, isAuthenticated, login }: any = Metamask.useContext();

  const disconnectToWallet = async (event: any) => {
    event.preventDefault();
    await logout();
    router.push('/');
  };



  const handleSetting = () => {
    router.push("/admin/setting")
  }

  const connectToWallet = async (event: any) => {
    event.preventDefault();
    await login();
  };

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt={user.name}
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
        // src={user.name}
        />
      </Badge>
      <Menu
        
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar alt={user.name} sx={{ width: '2.5rem', height: '2.5rem' }} />
            </Badge>
            <Box sx={{ display: 'flex', marginLeft: 3, alignItems: 'start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                {user.role}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider />
        <div className='dashboard_menu'>

        <MenuItem sx={{ py: 4, width: "100%" }} onClick={handleSetting}>
          <SettingsIcon sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
          Setting
        </MenuItem>
        {
          isAuthenticated ?
            <MenuItem sx={{ py: 4, width: "100%" }} onClick={disconnectToWallet}>
              <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
              Logout
            </MenuItem> :
            <MenuItem sx={{ py: 2 }} onClick={connectToWallet}>
              <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
              Login
            </MenuItem>
        }
        </div>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
