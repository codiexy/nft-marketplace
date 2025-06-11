import React, { Component } from 'react'
import { TrendingAuctions } from 'components/admin/views/admin';
import { getAdminServerProps } from 'utils/server/getServerProps';

export default class auctions extends Component {
  render() {
    return (
      <div>
        <TrendingAuctions />
      </div>
    )
  }
}

export const getServerSideProps = (context: any) => {
  return getAdminServerProps(context);
}