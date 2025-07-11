import { NextApiRequest, NextApiResponse } from "next";
import { NftLike } from "backend/models";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "POST") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const { id }: any = req.query;
            const nftLike = new NftLike(req, res);
            const result = await nftLike.likedByUser(id);
            res.status(200).json({
                status: 'success',
                data: {
                    id: result._id
                }
            });
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