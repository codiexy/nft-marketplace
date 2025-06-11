import { getTokenData } from "services";
import { SECRET } from "utils/constants";


export const getAdminServerProps = (context: any) => {
    const cookies = context.req.cookies;
    const token = cookies[SECRET] || "";
    if(token) {
        const data: any = getTokenData(token);
        const isAllowed = data?.user?.role === "ADMIN" || data?.user?.role === "AUTHORIZER" || false;
        if (isAllowed) {
            return { props: {} };
        }
    }
    return {
        redirect: {
            permanent: true,
            destination: "/",
        }
    }
}