import FeaturedCollections from 'components/admin/views/admin/Collections'
import React, { Component } from 'react'
import { getAdminServerProps } from 'utils/server/getServerProps';

export default class Collections extends Component {
  render() {
    return (
      <div>
        <FeaturedCollections />
      </div>
    )
  }
}

export const getServerSideProps = (ctx: any) => {
  return getAdminServerProps(ctx);
};

