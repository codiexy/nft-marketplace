

import { FaNeos, FaHome, FaUsers } from 'react-icons/fa'
import CampaignIcon from '@mui/icons-material/Campaign';

// ** Type import
import { VerticalNavItemsType } from 'components/admin/@core/layouts/types'
import { BsCollectionFill } from 'react-icons/bs';
import { MdLocalOffer } from 'react-icons/md';
import { RiAuctionFill } from 'react-icons/ri'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      icon: FaHome,
      path: '/admin/dashboard'
    },
    {
      sectionTitle: 'Landing Page'
    },
    {
      title: 'Featured Artists',
      icon: FaUsers,
      path: '/admin/artists'
    },
    {
      title: ' Trending Auctions',
      icon: RiAuctionFill,
      path: '/admin/trending_auctions'
    },
    {
      title: 'Featured Collections',
      icon: BsCollectionFill,
      path: '/admin/collections'
    },
    {
      sectionTitle: 'Auto Refund/Transfer'
    },
    {
      title: 'Offer Nfts',
      icon: MdLocalOffer,
      path: '/admin/offers'
    },
    {
      title: 'Auction Nfts',
      icon: RiAuctionFill,
      path: '/admin/auctions'
    },
    {
      sectionTitle: 'Advertisement'
    },
    {
      title: 'All Campaigns',
      icon: CampaignIcon,
      path: '/admin/campaigns'
    },
    {
      sectionTitle: 'Others'
    },
    {
      title: 'All Nfts',
      icon: FaNeos,
      path: '/admin/nfts'
    },
    {
      title: 'Users',
      icon: FaUsers,
      path: '/admin/users'
    },
    {
      title: 'Authorizors',
      icon: FaUsers,
      path: '/admin/authorizors'
    },

  ]
}

export default navigation
