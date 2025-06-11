import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import Model from "./Model";
import { Nft } from './Nft';

export class NftComments extends Model {

    public collection: string = "nft_comments";

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("nft_comments", req, res);
    }


    saveNftComment = async (formData: any) => {
        try {
            const NftModel = new Nft(this.request, this.response);
            const nft = await NftModel.first(formData.nftId)
            if (!nft) throw new Error("Invalid nft id!");
            await this.insert({
                nftId: new ObjectId(formData.nftId),
                type: formData.type === "textarea" ? "text" : formData.type,
                comment: formData.comment,
                status: "publish",
                image: formData.image
            });

        } catch (error: any) {
            throw new Error(error.message || "Something went wrong");
        }
    }

    getCommentByNftId = async (nftId: string, options: any = {}) => {

        const andOptions: any = [
            { nftId: new ObjectId(nftId) },
        ];
        const responseType = options?.response?.trim() == "single" ? 'single' : "multi";

        return this.aggregate([
            {
                $match: { $and: andOptions }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "creator",
                },
            },

            { $unwind: "$creator" },
        ], responseType)


    }


    // getCommentByNftId = async (nftId: string, options: any = {}) => {
    //     let {
    //         sort = { "updatedAt": -1 },
    //     } = options;
    //     const NftModel = new Nft(this.request, this.response);
    //     const nft = await NftModel.first(nftId)
    //     if (!nft) throw new Error("Invalid nft id!");
    //     const id = new ObjectId(nftId);
    //     await this.aggregate([
    //         {
    //             $match: {
    //                 $and: [
    //                     { $expr: { $eq: ["$createdBy", new ObjectId(this.user.id)] } },
    //                     { $expr: { $eq: ["$nftId", id] } },

    //                 ]
    //             },
    //         }

    //     ], 'single');
    //     return await this.get({ nftId: id })

    // }

    updateComment = async (id: any, inputData: any) => {
        try {
            if (Object.keys(inputData).length) {
                const result = await this.update(id.toString(), {
                    comment: inputData,
                });
                return result ? true : false;
            }
            return false;
        } catch (error) {
            return false
        }
    }

    deleteComment = async (id: string) => {
        await this.connectDb();
        return await this.db.deleteOne({
            _id: new ObjectId(id),
            createdBy: new ObjectId(this.user.id)
        });
    }

}