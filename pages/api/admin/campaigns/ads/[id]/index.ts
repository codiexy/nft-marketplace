import { NextApiRequest, NextApiResponse } from "next";
import { CampaignAd } from "backend/models";
import { validateCampaignAdData } from "..";
import { getSession } from "utils/server/getSession";
export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const campaignAdModel = new CampaignAd(req, res);
        const id: any = req.query.id;
        const { status } = await getSession(req, res, true);
        switch (req.method?.toLocaleLowerCase()) {
            case "get":
                const campaignAd = await campaignAdModel.find(id);
                res.status(200).json({
                    status: 'success',
                    message: "",
                    data: campaignAd
                })
                break;
            case "put":
                if (!status) {
                    throw new Error("You are not authenticated!");
                }
                const inputData = await validateCampaignAdData(req, res, id)
                await campaignAdModel.update(id, inputData);
                res.status(200).json({
                    status: 'success',
                    message: "",
                })
                break;
            case "delete":
                if (!status) {
                    throw new Error("You are not authenticated!");
                }
                await campaignAdModel.delete(id);
                res.status(200).json({
                    status: 'success',
                    message: "Campaign Ad deleted successfully!",
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