import AllArtists from 'components/admin/views/admin/Artists'
import AdSetting from 'components/admin/views/admin/campaigns/AdSetting';
import React, { Component } from 'react'
import { getTokenData } from 'services';
import { SECRET } from 'utils';

export default class artists extends Component {
  render() {
    return (
      <div>
        <AdSetting />
      </div>
    )
  }
}

export const getServerSideProps = (context: any) => {
    const cookies = context.req.cookies;
    const token = cookies[SECRET] || "";
    const data: any = getTokenData(token);
    if (!data) {
        return {
            redirect: {
                permanent: true,
                destination: "/",
            },
        }
    }
    return { props: { user: data.user } };
}
