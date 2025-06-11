import AllArtists from 'components/admin/views/admin/Artists'
import React, { Component } from 'react'
import { getAdminServerProps } from 'utils/server/getServerProps';

export default class artists extends Component {
  render() {
    return (
      <div>
        <AllArtists />
      </div>
    )
  }
}


export const getServerSideProps = (ctx: any) => {
  return getAdminServerProps(ctx);
};
