import { NextApiRequest, NextApiResponse } from "next";
import { User } from "utils/api/user";


export const getSession = async (req: NextApiRequest, res: NextApiResponse, admin: boolean = false) => {
    const authUser = new User(req, res);
    const id: any = authUser.isAuthenticate();
    let data: any = false;
    let status: boolean = Boolean(id);
    if(id) {
        data = await authUser.first(id);
        if(admin) {
            status = data.role === "ADMIN" || data.role === "AUTHORIZER" || false;
            data = status ? data : false;
        }
    }
    return { status, data };
}