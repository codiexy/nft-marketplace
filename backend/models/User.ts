import { optionProps, UserWalletAddress } from '@types';
import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'

import Model from "./Model";

export class User extends Model {

    collection: string = "users";

    public defaultPipeline = [
        {
            $lookup: {
                from: "followers",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$createdBy", "$$userId"] }
                        }
                    },
                    {
                        $count: "count"
                    }

                ],
                as: "followings",
            }
        },
        {
            $lookup: {
                from: "content_management",
                localField: "_id",
                foreignField: "userId",
                as: "orderValue",
            },
        },
        {
            $lookup: {
                from: "followers",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$userId", "$$userId"] }
                        }
                    },
                    {
                        $count: "count"
                    }

                ],
                as: "followers",
            }
        },
        {
            $lookup: {
                from: "nfts",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$ownedBy", "$$userId"] }
                        }
                    },
                    { $count: "count" }
                ],
                as: "ownedNft",
            },
        },
        {
            $lookup: {
                from: "nfts",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$createdBy", "$$userId"] }
                        }
                    },
                    { $count: "count" }
                ],
                as: "createdNft",
            },
        },
        {
            $lookup: {
                from: "collections",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$createdBy", "$$userId"] }
                        }
                    },
                    {
                        $count: "count"
                    }

                ],
                as: "collections",
            }
        }
    ]

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("users", req, res, [
            '/login'
        ]);
    }

    getAll = async (options: optionProps) => {
        let {
            match,
            skip = 0,
            limit = 0,
            sortBy = "updatedAt",
            sort = -1,
            others = []
        } = options;

        sortBy = typeof sortBy === "object" ? sortBy : [sortBy];
        let pipeline: any = [...this.defaultPipeline, { $sort: { sortBy: sort } }, ...others];
        if (match) {
            pipeline = [...pipeline, { $match: match }];
        }
        if (limit > 0) {
            pipeline = [...pipeline, { $limit: limit + skip }];
        }
        if (skip > 0) {
            pipeline = [...pipeline, { $skip: skip }];
        }

        return await this.aggregate(pipeline);
    }


    getDetails = async (objectId: ObjectId, options = {}) => {
        options = typeof options === 'object' && options ? options : {};
        const pipeline: any = [...this.defaultPipeline, { $match: { _id: objectId } }];
        return await this.aggregate(pipeline, "single");
    }

    setAdmin = async (value: any, type: string = "artist", column = "_id") => {
        try {
            await this.connectDb();
            let inputData = {};
            if (type === "admin") {
                inputData = {
                    role: "ADMIN",
                }
            }
            const query = {
                [column]: value
            }
            if (Object.keys(inputData).length) {
                const result = await this.db.updateOne(
                    query,
                    { $set: inputData }
                )
                return result.acknowledged ? true : false;
            }
            return false;
        } catch (error) {
            return false
        }
    }

    setAuthorizers = async (addresses: UserWalletAddress[] = []) => {
        if(this.user.role === "ADMIN" || this.user.role === "AUTHORIZER") {
            if(!addresses.length) throw new Error('Atleast one address is required!');
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const checkUser = await this.first(address, {}, "ethAddress");
                if(checkUser) {
                    await this.update(checkUser.id.toString(), {
                        role: "AUTHORIZER",
                        isApproved: true
                    });
                }                
            }
        } else {
            throw new Error("You are not authenticated!");
            
        }
    }

    removeAuthorizer = async (addresses: UserWalletAddress[] = []) => {
        if(this.user.role === "ADMIN" || this.user.role === "AUTHORIZER") {
            if(!addresses.length) throw new Error('Atleast one address is required!');
            this.request.method = "PUT";
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const checkUser = await this.first(address, {}, "   ");
                if(checkUser && checkUser.id.toString() != this.user.id.toString()) {
                    await this.update(checkUser.id.toString(), {
                        role: "USER",
                        isApproved: false
                    });
                }                
            }
        } else {
            throw new Error("You are not authenticated!");
            
        }
    }
}