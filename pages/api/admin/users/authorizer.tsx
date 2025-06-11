import { NextApiRequest, NextApiResponse } from "next";
import { User } from "backend/models";
import { getSession } from "utils/server/getSession";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { addresses }: any = req.body;
        const userModel = new User(req, res);
        const { status } = await getSession(req, res, true);
        if (!status) {
            throw new Error("You are not authenticated!");
        }
        switch (req.method?.toLocaleLowerCase()) {
            case "put":
                await userModel.setAuthorizers(addresses);
                res.status(200).json({
                    status: 'success',
                    message: "Successfully added!"
                })
                break;
            case "delete":
                await userModel.removeAuthorizer(addresses);
                res.status(200).json({
                    status: 'success',
                    message: "Successfully remove address from authorizer!"
                })
                break;
            default:
                throw new Error("Invalid method");
                break;
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "something went wrong."
        });
    }
}