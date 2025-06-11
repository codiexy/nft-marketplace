import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import Layout from "../../components/Layout"
import Explore from "../../components/Explore"
import { getAllItems, getAllSearch } from '../../services';

export default function BaseExplore({ query }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [explores, setExplores] = useState<any[]>([]);
    const [updated, setUpdated] = useState<Boolean>(false);
    const [filters, setFilters] = useState<any>(query);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const results = await getAllItems({
                limit: 20,
                ...filters
            });
            setExplores(results);
            setIsLoading(false);
        })();
    }, [updated, filters]);

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
            <Explore
                explores={explores}
                useUpdated={() => [updated, setUpdated]}
                useFilter={() => [filters, handleSearch]}
            />
        </Layout>
    )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
    // Pass data to the page via props
    return { props: { query: context.query || {} } }
}

