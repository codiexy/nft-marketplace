import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import Model from "./Model";

export class ContentManagement extends Model {

    collection: string = "content_management";

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super("content_management", req, res);
    }

    async createOrUpdateAndDelete (formData: any) {
        const inputData: any = formData.data || [];
        const contentData = await this.get({ 'orderType': formData.type });
        this.request.method = 'DELETE';
        const data = await contentData.map(async (content: any) => {
            const id = (content?.id || content?._id) || "";
            if(id.toString()) {
                await this.delete(id.toString());
            }
        });
        await Promise.all(data);
        this.request.method = 'POST';
        for (let i = 0; i < inputData.length; i++) {
            let newInputData: any = {
                orderValue: inputData[i].orderValue,
                orderType: inputData[i].orderType
            }
            if(formData.type === "auction") {
                newInputData.nftId = new ObjectId(inputData[i].nftId)
            } else if(formData.type === "collection") {
                newInputData.collectionId = new ObjectId(inputData[i].collectionId)
            } else {
                newInputData.userId = new ObjectId(inputData[i].userId)
            }
            await this.insert(newInputData);       
        }
    }
    
}