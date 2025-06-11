import React from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Layout from 'components/admin/layouts/Layout'
import { Auctions } from 'components/admin/views/admin'
import { getAdminServerProps } from 'utils/server/getServerProps'

function AllAuctions() {
    return (
        <div>
            <Layout>
                <Grid container spacing={6}>

                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title='All Auctions Nfts' titleTypographyProps={{ variant: 'h6' }} />
                            <Auctions />
                        </Card>
                    </Grid>

                </Grid>
            </Layout>
        </div>
    )
}

export const getServerSideProps = (ctx: any) => {
    return getAdminServerProps(ctx);
};

export default AllAuctions;
