import React, {  useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { getAllItems, getCollections, getUsers } from 'services'
import Layout from '../../layouts/Layout'
import StorageIcon from '@mui/icons-material/Storage';
import { FaNeos, FaUsers } from 'react-icons/fa'
import { BsCollectionFill } from 'react-icons/bs'


function Dashboard() {

  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any>([])
  const [nfts, setNfts] = useState<any>([])
  const [collections, setCollections] = useState<any>([])

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const allusers = await getUsers();
      const allnfts = await getAllItems();
      const allcollections = await getCollections()
      setUsers(allusers);
      setNfts(allnfts);
      setCollections(allcollections);
      setIsLoading(false);
    })()
  }, [])

  return (
    <div>
      <Layout>
        <Card>

          <CardContent sx={{ pt: theme => `${theme.spacing(3)} !important` }}>
            <Grid container spacing={[5, 0]}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    variant='rounded'
                    sx={{
                      mr: 3,
                      width: 44,
                      height: 44,
                      boxShadow: 3,
                      color: 'common.white',
                      backgroundColor: '#56CA00'
                    }}
                  >
                    <FaUsers size='1.75rem'  />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='caption'>USERS</Typography>
                    <Typography variant='h6'> {users ? users.length : 0} </Typography>
                  </Box>
                </Box>

              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    variant='rounded'
                    sx={{
                      mr: 3,
                      width: 44,
                      height: 44,
                      boxShadow: 3,
                      color: 'common.white',
                      backgroundColor: '#FFB400'
                    }}
                  >
                   <FaNeos size='1.75rem' />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='caption'>NFTS</Typography>
                    <Typography variant='h6'> {nfts ? nfts.length : 0}</Typography>
                  </Box>
                </Box>

              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    variant='rounded'
                    sx={{
                      mr: 3,
                      width: 44,
                      height: 44,
                      boxShadow: 3,
                      color: 'common.white',
                      backgroundColor: '#16B1FF'
                    }}
                  >
                    <BsCollectionFill size='1.75rem' />
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant='caption'>Collections</Typography>
                    <Typography variant='h6'>{collections ? collections.length : 0}</Typography>
                  </Box>
                </Box>

              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Layout>
    </div>
  )
}

export default Dashboard
