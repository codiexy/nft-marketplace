import { NextApiRequest, NextApiResponse } from "next";
import { Nft, NFTItemOnSaleData } from "backend/models";
import moment from "moment";
import { getSession } from "utils/server/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "PUT") {
            const { status } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const { id }: any = req.query;
            const nftId: string = id;
            const nftModel = new Nft(req, res);
            const inputData: NFTItemOnSaleData = await validateData(req, res, id);
            const result = await nftModel.nftItemOnSale(nftId, inputData);
            if (result) {
                res.status(200).json({
                    status: 'success',
                    message: "Item set on sale successfully!",
                    data: {
                        id: id
                    }
                })
            } else {
                throw new Error("Something went wrong!");
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

const validateData = async (req: NextApiRequest, res: NextApiResponse, _id: string) => {
    if (typeof req.body === "object") {
        const nftModel = new Nft(req, res);
        const nftData = await nftModel.first(_id);
        if (nftData) {
            const formData = req.body;
            const marketplace = formData.marketplace || {};
            const listingType = marketplace.type?.trim() || "";
            var message: string = "";
            var price: number = 0;
            if (!listingType) {
                message = "Invalid listing type";
            }
            if (listingType != "fixed_price" && !marketplace?.typeId) {
                message = "Invalid sale type id!";
            }
            if (listingType === "fixed_price" || listingType === "open_for_bids") {
                if (parseFloat(marketplace.price) <= 0) {
                    message = "Invalid listing price for nft item";
                }
                price = marketplace.price;
            } else if (listingType === "timed_auction") {
                if (parseFloat(marketplace.minBid || "0") <= 0) {
                    message = "Minimum bid must be required!"
                } else if (!marketplace.startDate) {
                    message = "Start date must be required!"
                } else if (!marketplace.endDate) {
                    message = "End date must be required!"
                } else if (!moment(marketplace.endDate).isAfter(marketplace.startDate)) {
                    message = "End date must be greater than start date!"
                }
                price = marketplace.minBid;
            }
            if (message) throw new Error(message);
            const inputData: any = {
                transactions: {
                    [listingType]: formData.transactions,
                    [`${listingType}_token`]: formData.approvalTokenTransaction,
                },
                onMarketPlace: true,
                token: formData.token || "",
                marketplace: marketplace,
                price,
                status: listingType === "timed_auction" ? "on_auction" : "on_sale",
            }
            return inputData;
        } else {
            throw new Error("Invalid nft id");
        }
    } else {
        throw new Error("Invalid form data");
    }
}