import AllAds from 'components/admin/views/admin/Ads'
import React, { Component } from 'react'
import { getAdminServerProps } from 'utils/server/getServerProps';

export default class Campaigns extends Component {
  render() {
    return (
      <div>
        <AllAds />
      </div>
    )
  }
}

export const getServerSideProps = (ctx: any) => {
  return getAdminServerProps(ctx);
};
