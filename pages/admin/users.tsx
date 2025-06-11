
import Grid from '@mui/material/Grid'
import Layout from 'components/admin/layouts/Layout'
import { AllUsers } from 'components/admin/views/admin'
import { getAdminServerProps } from 'utils/server/getServerProps'


const Users = () => {
  return (
    <Layout>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <AllUsers />
        </Grid>
      </Grid>
    </Layout>
  )
}

export const getServerSideProps = (ctx: any) => {
    return getAdminServerProps(ctx);
};

export default Users
