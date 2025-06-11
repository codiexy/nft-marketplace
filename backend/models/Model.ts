import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClientOptions, ObjectId } from 'mongodb'

import { MongoDbClient } from 'utils/api/mongodb'

import type { InsertInputProps, UpdateInputProps } from '@types';
import { getCookie } from 'cookies-next';
import { SECRET } from 'utils';
import { getTokenData } from 'services';

export class Model extends MongoDbClient {

    protected request: NextApiRequest;
    protected response: NextApiResponse;
    protected userToken: string;
    protected user: any = {};
    protected collection: string;
    private notAuthenticatedUrls: any;

    protected saleTypes = ['fixed_price', "timed_auction", "open_for_bids"];
    public ethToDollarApi = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum';

    private MongodbClientOptions: MongoClientOptions = {
        // serverSelectionTimeoutMS: 10, 
        connectTimeoutMS: 20000
    };

    constructor(collection: string, req: NextApiRequest, res: NextApiResponse, urls: any = []) {
        super();
        this.collection = collection;
        this.request = req;
        this.response = res;
        this.notAuthenticatedUrls = urls?.length ? urls.filter((url: string) => url) : typeof urls === "string" && urls === "*" ? "*" : [];
        const token: any = getCookie(SECRET, { req, res });
        const tokenData = getTokenData(token);
        // if(!tokenData) throw new Error("Invalid token");

        this.userToken = token;
        if (tokenData) {
            this.user = tokenData.user;
        }
    }

    connectDb = async () => {
        await this.connect(`${this.mongodbUri}/${this.database}`, this.collection, this.MongodbClientOptions);
        if (!this.db) {
            throw new Error("Database connection failed!");
        }
    }

    async get(options: any = {}) {
        try {
            await this.connectDb();
            const result = await this.db.find(options).toArray();
            return result;
            return result.map((data: any) => {
                if (typeof data._id != "undefined") {
                    data.id = data._id;
                }
                return data;
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async first(
        value: any,
        options: any = {},
        column: string = "_id"
    ) {
        try {
            await this.connectDb();
            options[column] = column === "_id" ? new ObjectId(value) : value;
            let result = await this.db.find(options).toArray();
            if (result.length) {
                result = result.shift();
                result.id = result._id;
                delete result._id;
                return result;
            }
            return false;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async _create(data: any) {
        await this.connectDb();
        const result = await this.db.insertOne(data);
        return {
            _id: result.insertedId ? result.insertedId.toString() : ""
        };
    }

    async insert(inputData: any, options: any = {}) {
        try {
            const newInputData: InsertInputProps = {
                ...inputData,
                createdBy: new ObjectId(this.user.id),
                updatedBy: new ObjectId(this.user.id),
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            return await this._create(newInputData);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // 
    async insertMany(inputData: any[] = [], options: any = {}) {
        try {
            await this.connectDb();
            const restricted = typeof options.restricted === "boolean" ? options.restricted : true;
            if (this.request.method === 'POST' || !restricted) {
                const result = await this.db.insertMany(inputData);
            } else {
                throw new Error("Invalid Method");
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // 
    async _update(data: any, query: any = {}) {
        await this.connectDb();
        const result = await this.db.updateOne(
            query,
            { $set: data }
        )
        return result.acknowledged ? true : false;

    }

    async update(value: string | number | boolean | ObjectId, inputData: any, options: any = {}, column: string = "_id") {
        try {
            const query: any = {};
            if (column === "_id") {
                if (typeof value === "string") {
                    query._id = new ObjectId(value);
                } else {
                    throw new Error("Invalid _id value type!");
                }
            } else {
                query[column] = value;
            }
            if (typeof inputData.createdAt !== "undefined") delete inputData.createdAt;
            if (typeof inputData.createdBy !== "undefined") delete inputData.createdBy;
            const newInputData: UpdateInputProps = {
                ...inputData,
                updatedBy: new ObjectId(this.user.id),
                updatedAt: new Date(),
            }
            return await this._update(newInputData, query);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async _updateMany(data: any, filter: any = {}) {
        await this.connectDb();
        return await this.db.updateMany(
            filter,
            { $set: data }
        );
    }

    async updateMany(value: any, inputData: any, options: any = {}, column: string = "_id") {
        try {
            const query: any = {};
            if (column === "_id") {
                if (typeof value === "string") {
                    query._id = new ObjectId(value);
                } else {
                    throw new Error(`Invalid ${column} column value type!`);
                }
            } else {
                query[column] = value;
            }
            if (typeof inputData.createdAt !== "undefined") delete inputData.createdAt;
            if (typeof inputData.createdBy !== "undefined") delete inputData.createdBy;
            const newInputData: UpdateInputProps = {
                ...inputData,
                updatedBy: new ObjectId(this.user.id),
                updatedAt: new Date(),
            }
            return await this._updateMany(newInputData, query);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async delete(value: any, _id: string = "_id") {
        try {
            await this.connectDb();
            const query: any = {};
            if (_id === "_id") {
                if (typeof value === "string") {
                    query._id = new ObjectId(value);
                } else if (typeof value === "object") {
                    throw new Error("Invalid _id value type!");
                }
            } else {
                query[_id] = value;
            }
            return await this.db.deleteOne(query);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    aggregate = async (pipeline: any, res: string = "multi") => {
        try {
            await this.connectDb();
            let result = (await this.db?.aggregate(pipeline).toArray()) || [];
            result = result.filter((i: any) => {
                i.id = i._id;
                delete i._id;
                return i
            });
            if (res === "single") {
                return result?.shift() || false;
            }
            return result;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    checkAuthentication = () => {
        const query: any = this.request.query || {};
        const currentUrl = this.request.url?.slice(-1) === "/" ? this.request.url?.slice(0, -1) : (this.request.url || "");
        if (this.notAuthenticatedUrls === "*") {
            return true;
        } else {
            for (let index = 0; index < this.notAuthenticatedUrls.length; index++) {
                var url = this.notAuthenticatedUrls[index];
                url = url?.slice(-1) === "/" ? url?.slice(0, -1) : (url || "");
                const params = url.match(/[^[\]]+(?=])/g) || [];
                params.forEach((param: string) => {
                    url = url.replace(`[${param}]`, query[param]);
                });
                const checkUrl = '/api' + url;
                if (currentUrl === checkUrl) return true;
            }
            return false;
        }

    }

    getIpAddress = async () => {
        try {
            const result: any = await fetch("https://api.ipify.org?format=json")
                .then(res => res.json());

            return result.ip;
        } catch (error: any) {
            console.error(error.message)
        }

    }
}


export default Model