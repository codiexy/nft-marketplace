import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAllSearch } from "services";
import Layout from "../components/Layout"
import Search from "../components/Search"

export default function BaseHome({ query }: any) {

  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<any>(query);
  const [collections, setCollections] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [updated, setUpdated] = useState<Boolean>(false);

  const router = useRouter()
  const { keyword } = router.query;

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const results = await getAllSearch({
        ...filters,
        keyword
      });
      setCollections(results.collections || []);
      setNfts(results.nfts || []);
      setUsers(results.users || []);
      setIsLoading(false);
    })();

  }, [keyword, updated, filters])


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
      <Search
        collections={collections}
        nfts={nfts}
        users={users}
        useFilter={() => [filters, handleSearch]}
      />
    </Layout>
  )
}

export const getServerSideProps = async (context: any) => {
  return { props: { query: context.query || {} } };
}