import { NextApiRequest, NextApiResponse } from "next";
import { Nft } from "backend/models";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "PUT") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const { id }: any = req.query;
            const auctionId = req.body.auctionId;
            const nftModel = new Nft(req, res);
            const result = await nftModel.transferNftItem(id, {
                transaction: req.body.transaction,
                auctionId
            });
            res.status(200).json({
                status: 'success',
                message: "successfully buy nft!",
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