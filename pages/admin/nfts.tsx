import React from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Layout from 'components/admin/layouts/Layout'
import { AllNfts } from 'components/admin/views/admin'
import { getAdminServerProps } from 'utils/server/getServerProps'

const Nfts = () => {
    return (
        <Layout>
            <Grid container spacing={6}>

                <Grid item xs={12}>
                    <Card>
                        <CardHeader title='All Nfts' titleTypographyProps={{ variant: 'h6' }} />
                        <AllNfts />
                    </Card>
                </Grid>

            </Grid>
        </Layout>
    )
}

export const getServerSideProps = (ctx: any) => {
    return getAdminServerProps(ctx);
};

export default Nfts
