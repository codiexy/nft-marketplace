import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Layout from "../../../components/Layout"
import { getAllItems, getCollectionById } from "../../../services";
import { Details } from "../../../components/collections";


export default function BaseCollectionDetails({ query }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [collection, setCollection] = useState<any | Boolean>(false);
    const [filters, setFilters] = useState<any>(query);
    const [updated, setUpdated] = useState<Boolean>(false);
    const [nfts, setNfts] = useState<any[]>([]);
    const router = useRouter()
    const collectionId: any = router.query.collectionId;


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            if (collectionId) {
                const result = await getCollectionById(collectionId);
                if (Object.keys(result).length) {
                    setCollection(result);
                }
            }

            const items = await getAllItems({
                ...filters,
                collectionId: collectionId,
                skip: 0,
                limit: 20,
                collection: collectionId,
                creator: true,
                owner: true,
                view: true,
                like: true,
            });
            setNfts(items);
            setIsLoading(false);
        })();
    }, [collectionId, updated, filters])

    const handleSearch = async (data = {}) => {
        if (Object.keys(data).length) {
            setFilters(data);
        } else {
            setFilters(data);
        }
        setUpdated(!updated);
    }

    return (
        <Layout isLoading={isLoading} is404={!collection}>
            <Details
                id={collectionId}
                nfts={nfts}
                collection={collection}
                useFilters={() => [filters, handleSearch]}
            />
        </Layout>
    )
}


export const getServerSideProps = (context: any) => {

    return { props: { query: context.query || {} } }
}
