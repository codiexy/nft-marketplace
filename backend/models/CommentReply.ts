import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import Model from "./Model";
import { Nft } from './Nft';
import { NftComments } from './NftComments';

export class CommentReply extends Model {

    public collection: string = "nft_comments_reply";
    public defaultPipeline = [
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "creator",
            },
        },

        { $unwind: "$creator" },
    ]

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("nft_comments_reply", req, res);
    }


    saveReplyComment = async (commentId: any, formData: any) => {
        try {
            const NftModel = new Nft(this.request, this.response);
            const nft = await NftModel.first(formData.nftId)
            if (!nft) throw new Error("Invalid nft id!");
            await this.insert({
                commentId: new ObjectId(commentId),
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

    getReplyComment = async (commentId: string, options: any = {}) => {
        const andOptions: any = [
            { commentId: new ObjectId(commentId) },
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

    updateReplyComment = async (replyId: any, id: any, inputData: any) => {
        try {
            if (Object.keys(inputData).length) {
                if (!id) throw new Error("Invalid comment Id");
                const result = await this.update(replyId.toString(), {
                    comment: inputData,
                });
                return result ? true : false;
            }
            return false;
        } catch (error) {
            return false
        }
    }

    deleteReplyComment = async (replyId: any, id: string) => {
        if (!id) throw new Error("Inavlid commentId");
        await this.connectDb();
        return await this.db.deleteOne({
            _id: new ObjectId(replyId),
            createdBy: new ObjectId(this.user.id)
        });
    }

}