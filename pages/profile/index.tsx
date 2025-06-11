import Layout from "components/Layout"
import { Profile } from "components/profile"
import { useEffect, useState } from "react";
import { getAllItems, getCollections, getUserById } from "services";
import { SECRET } from "utils";
import { JWT } from "utils/jwt";

export default function BaseProfile({ user, query }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<any>(query);
    const [updated, setUpdated] = useState<Boolean>(false);
    const [nfts, setNfts] = useState<any[]>([]);
    const [collected, setCollected] = useState<any[]>([]);
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const currentUserId: any = user.id;
        (async () => {
            setIsLoading(true);
            const currentUser: any = await getUserById(currentUserId);
            if (currentUser.ownedNftCount) {
                // Get creator owned nfts
                const collectedNfts = await getAllItems({
                    ...filters,
                    ownedBy: user.id,
                    limit: 20
                });
                setCollected(collectedNfts);
            }
            if (currentUser.createdNftCount) {

                const items = await getAllItems({
                    ...filters,
                    createdBy: user.id,
                    limit: 20
                });
                setNfts(items);
            }

            if (currentUser.collectionCount) {
                const userCollections = await getCollections({
                    ...filters,
                    createdBy: currentUserId,
                    limit: 20
                });
                setCollections(userCollections);
            }
            setIsLoading(false);
        })();
    }, [updated, filters, user.id])


    const handleSearch = async (data = {}) => {
        if (Object.keys(data).length) {
            setFilters(data);
        } else {
            setFilters(data);
        }
        setUpdated(!updated);
    }

    return (
        <Layout is404={!user} isLoading={isLoading}>
            <Profile
                collections={collections}
                nfts={nfts}
                collected={collected}
                useFilter={() => [filters, handleSearch]}
            />
        </Layout>
    )
}

export const getServerSideProps = (context: any) => {
    const cookies = context.req.cookies;
    const token = cookies[SECRET] || "";
    if (!token) {
        return {
            redirect: {
                permanent: true,
                destination: "/",
            },
        }
    }
    const jwt = new JWT();
    const data: any = jwt.varifyToken(token);
    return { props: { user: data, query: context.query || {} } };
}
