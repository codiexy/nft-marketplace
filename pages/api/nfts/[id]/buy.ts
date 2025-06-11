import { NextApiRequest, NextApiResponse } from "next";
import { Nft } from "backend/models";
import { validateBuyData } from "backend/schema";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "PUT") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const { id }: any = req.query;
            const nftModel = new Nft(req, res);
            const validateResult = await validateBuyData({
                transaction: req.body.transaction
            });
            if(validateResult.status) {
                await nftModel.buyNftItem(id, validateResult.data.transaction);
                res.status(200).json({
                    status: 'success',
                    message: "successfully buy nft!",
                    data: {}
                });
            } else {
                throw new Error(validateResult.errors.shift());
            }

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