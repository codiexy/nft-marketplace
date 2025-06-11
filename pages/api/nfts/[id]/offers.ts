import { NextApiRequest, NextApiResponse } from "next";

import { Nft, NftOffer } from "backend/models"; 
import { validateMakeAOffer } from "backend/schema";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id }: any = req.query;
        if (req.method === "POST") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const nftModel = new Nft(req, res);
            const validateResult = await validateMakeAOffer({
                transaction: req.body.transaction,
                price: req.body.price,
                expiredDate: req.body.expiredDate
            });
            if(validateResult.status) {
                await nftModel.makeAOffer(id, validateResult.data);
                res.status(200).json({
                    status: 'success',
                    message: "successfully offered for a nft item!",
                    data: {}
                })
            } else {
                throw new Error(validateResult.errors.shift());
            }

        } else if(req.method === "GET") {
            const NftOfferModel = new NftOffer(req, res);
            const options  = getOptions(req);
            const nftOffers = await NftOfferModel.getAll(id, options);
            res.status(200).json({
                status: 'success',
                message: "",
                data: {
                    offers: nftOffers
                },
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

const getOptions = (req: NextApiRequest) => {
    let { 
        response = "multi", 
        current = false, 
    }: any = req.query;
    
    response = response === "single" ? "single" : "multi";
    current = (typeof current === "boolean" && current) || current === "true" ? true : false;
    return {
        response,
        current
    }
}