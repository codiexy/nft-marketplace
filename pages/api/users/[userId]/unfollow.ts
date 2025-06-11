import { NextApiRequest, NextApiResponse } from "next";
import { Follower } from "backend/models";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "DELETE") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const { userId }: any = req.query;
            const userFollow = new Follower(req, res);
            const result = await userFollow.unfollwedByUser(userId);
            res.status(200).json({
                status: 'success',
                message: "Deleted successfully!",
                data: {}
            })
        } else {
            throw new Error("Invalid method");
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "something went wrong."
        });
    }
}