import React from 'react'

import {Grid, Card, CardHeader} from '@mui/material'
import Layout from 'components/admin/layouts/Layout'
import { Offers } from 'components/admin/views/admin'
import { getAdminServerProps } from 'utils/server/getServerProps'

const AllOffers = () => {
    return (
        <div>
            <Layout>
                <Grid container spacing={6}>

                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title='All Offers Nfts' titleTypographyProps={{ variant: 'h6' }} />
                            <Offers />
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

export default AllOffers;
