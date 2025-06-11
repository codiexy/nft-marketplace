import { NextApiRequest, NextApiResponse } from "next";
import { NftAuction } from "backend/models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "GET") {
            const { id }: any = req.query;
            const nftId: string = id; 
            const auctionModel = new NftAuction(req, res);
            const options  = getOptions(req);
            const result = await auctionModel.getAll(nftId, options);
            res.status(200).json({
                status: 'success',
                data: result
            });
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: error.message || "something went wrong."
        });
    }
}

const getOptions = (req: NextApiRequest) => {
    let { 
        response = "multi", 
        current = false, 
        history = false,
        winner = false
    }: any = req.query;
    
    response = response === "single" ? "single" : "multi";
    current = (typeof current === "boolean" && current) || current === "true" ? true : false;
    history = (typeof history === "boolean" && history) || history === "true" ? true : false;
    winner = (typeof winner === "boolean" && winner) || winner === "true" ? true : false;
    return {
        response,
        current,
        history,
        winner
    }
}


