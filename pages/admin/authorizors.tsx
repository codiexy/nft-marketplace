
import Grid from '@mui/material/Grid'
import Layout from 'components/admin/layouts/Layout'
import AllAuthorizors from 'components/admin/views/admin/AllAuthorizers'
import { getAdminServerProps } from 'utils/server/getServerProps'


const Authorizors = () => {
    return (
        <Layout>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <AllAuthorizors />
                </Grid>
            </Grid>
        </Layout>
    )
}

export const getServerSideProps = (ctx: any) => {
    return getAdminServerProps(ctx);
};

export default Authorizors
