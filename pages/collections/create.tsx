import Layout from "../../components/Layout"
import { Create } from "../../components/collections";
import { SECRET } from "utils";
import { getTokenData } from "services";


export default function CollectionCreate() {
    return (
        <Layout>
            <Create />
        </Layout>
    )
}

export const getServerSideProps = (context: any) => {
    const cookies = context.req.cookies;
    const token = cookies[SECRET] || "";
    const user: any = getTokenData(cookies[SECRET] || "");
    if (!user) {
        return {
            redirect: {
                permanent: true,
                destination: "/",
            },
        }
    }
    return { props: { loginUser: user } };
}