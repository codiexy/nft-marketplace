import type { NextApiRequest, NextApiResponse } from 'next'
import { Collection as UserCollectionModel, EthTransaction } from 'backend/models'
import type { CollectionInputFields } from '@types';
import { slugify } from 'helpers';
import { ObjectId } from 'mongodb';
import { User } from "utils/api/user";
import { NETWORK_CHAIN } from 'backend/utils/constants';
import { getSession } from 'utils/server/getSession';

interface optionProps {
    skip?: number;
    match?: any;
    limit?: number;
    nft?: Boolean;
    sortBy?: string | string[];
    sort?: string | string[] | -1;
    userId?: Boolean;
    others?: Array<{}>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const CollectionModel = new UserCollectionModel(req, res);
        if (req.method === "POST") {
            const { status, data: user } = await getSession(req, res);
            if (!status) {
                throw new Error("You are not authenticated!");
            }
            const inputData = validateFormData(req, user);
            const result = await CollectionModel.insert(inputData);
            if (result._id) {
                const ethTransaction = new EthTransaction(req, res);
                await ethTransaction.insert({
                    ...inputData.transactions,
                    type: "collection",
                    subType: "create",
                    moduleId: new ObjectId(result._id),
                    subModuleId: "",
                    saleTypeId: ""
                });
            }
            res.status(200).json({
                status: 'success',
                message: "Successfully created new collection.",
                data: result
            })
        } else {
            const options: optionProps = getOptions(req);
            const collections = await CollectionModel.getAll(options);
            res.status(200).json({
                status: 'success',
                message: "",
                data: {
                    collections: collections,
                }
            })
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

const getOptions = (req: NextApiRequest) => {
    const {
        limit = 0,
        skip = 0,
        sortBy = "updatedAt",
        sort = -1,
        createdBy = "",
        collection = "",
        category = "",
        genre = ""
    }: any = req.query;
    const match: any = {};
    if (createdBy) {
        match.createdBy = new ObjectId(createdBy.toString());
    }
    const options: optionProps = {
        limit: parseInt(limit.toString()),
        skip: parseInt(skip.toString()),
        sortBy: sortBy || "",
        sort,
        match
    };

    if (category) {
        options.match.category = new ObjectId(category);
    }
    if (genre) {
        options.match.genre = new ObjectId(genre);
    }
    if (collection) {
        options.match._id = new ObjectId(collection);
    }
    return options;
}

const validateFormData = (req: NextApiRequest, user: any) => {
    if (typeof req.body === "object") {
        const formData = req.body;
        const userId = user.id;
        const category = new ObjectId(formData.category);
        const genre = new ObjectId(formData.genre);
        const validateDate: CollectionInputFields = {
            name: formData.name,
            symbol: formData.symbol,
            description: formData.description,
            socialLinks: formData.socialLinks || {},
            transactions: formData.transactions,
            approvalTransaction: formData.approvalTransaction,
            contractAddress: formData.contractAddress,
            isVarified: false,
            banner: formData.banner,
            image: formData.image,
            feature: formData.feature,
            status: true,
            createdBy: userId,
            updatedBy: userId,
            category: category,
            genre: genre,
            slug: slugify(formData.name),
            blockchain: formData.blockchain || NETWORK_CHAIN,
            collaborators: formData.collaborators || [],
            creatorEarning: formData.creatorEarning || false,
            creatorEarningAddress: formData.creatorEarningAddress || "",
            explicitSensitiveContent: formData.explicitSensitiveContent || false,
        };
        return validateDate;
    } else {
        throw new Error("Invalid form data");

    }

}