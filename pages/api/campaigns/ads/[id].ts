import type { NextApiRequest, NextApiResponse } from 'next'
import { adConversion  } from 'backend/models'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "PUT") {
            const adConversionModel = new adConversion(req, res);
            const campaignAdId: any = req.query.id;
            const { type = "", nftId = "" }: any = req.body;
            const result = await adConversionModel.clickOrViewAd(campaignAdId, nftId, type);
            res.status(200).json({
                status: 'success',
                message: "Added successfully view or click ad data!",
                result
            })
        } else {
            throw new Error("Invalid method!");
        }
    } catch (error: any) {
        res
            .status(500)
            .json({
                status: "error",
                message: error.message || "something went wrong."
            });
    }
}




