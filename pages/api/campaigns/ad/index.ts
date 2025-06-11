import type { NextApiRequest, NextApiResponse } from 'next'
import { CampaignAd  } from 'backend/models'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const campaignAdModel = new CampaignAd(req, res);
        if (req.method === "GET") {
            const result = await campaignAdModel.getShowAd();
            res.status(200).json({
                status: 'success',
                message: "",
                data: result
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




