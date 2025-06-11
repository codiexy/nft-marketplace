import Dashboard from "components/admin/views/admin/Dashboard";
import { getAdminServerProps } from "utils/server/getServerProps";



export default function BaseDashboard() {

    return (
        <Dashboard />
    )
}

export const getServerSideProps = (ctx: any) => {
    return getAdminServerProps(ctx);
};
