import { formatNftData, getTokenData } from 'services'
import Layout from "components/Layout"
import Sell from "components/nft/Sell";
import { SECRET } from "utils";
import { getBaseUrl } from 'helpers/axios';

interface SellProps {
    nft: any;
}

export default function BaseSell({ nft }: SellProps) {
    return (
        <Layout>
            <Sell nft={nft} />
        </Layout>
    )
}

export const getServerSideProps = async (context: any) => {
    const { id }: any = context.query;
    const cookies = context.req.cookies;
    const loginUser: any = getTokenData(cookies[SECRET] || "");
    let nft = await fetch(getBaseUrl(`api/nfts/${id}`))
        .then(res => res.json())
        .then(res => res.data);

    if (loginUser && loginUser?.user?.id === nft?.ownedBy && !nft.onMarketPlace) {
        nft = await formatNftData(nft);
        return { props: { nft } };
    }

    return {
        notFound: true
    }
}
