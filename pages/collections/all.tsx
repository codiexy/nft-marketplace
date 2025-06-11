import Layout from "../../components/Layout"
import { Collection } from "../../components/collections";
import { useEffect, useState } from "react";
import { getCollections } from "services";

export default function BaseCollectionDetails({ query }: any) {


    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<any>(query);
    const [updated, setUpdated] = useState<Boolean>(false);


    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const results = await getCollections({
                ...filters
            });
            setCollections(results);
            setIsLoading(false);
        })();
    }, [updated, filters])


    const handleSearch = async (data = {}) => {
        if (Object.keys(data).length) {
            setFilters(data);
        } else {
            setFilters(data);
        }
        setUpdated(!updated);
    }
    return (
        <Layout isLoading={isLoading}>
            <Collection
                collections={collections}
                useFilter={() => [filters, handleSearch]}
            />
        </Layout>
    )
}

export const getServerSideProps = (context: any) => {

    return { props: { query: context.query || {} } }
}
