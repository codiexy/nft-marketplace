import { NextApiRequest, NextApiResponse } from "next";
import { CampaignAd, CampaignGroup } from "backend/models";
import { validateCampaignAdForm } from "schemas/form/campaigns";
import formidable from "formidable";

import { removeFile, saveFile } from 'utils/server/uploadFile'
import { getSession } from "utils/server/getSession";

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const campaignAdModel = new CampaignAd(req, res);
        campaignAdModel.checkAuthentication();
        switch (req.method?.toLocaleLowerCase()) {
            case "get":
                const campaignAds = await campaignAdModel.getAll();
                res.status(200).json({
                    status: 'success',
                    message: "",
                    data: {
                        ads: campaignAds
                    }
                })
                break;
            case "post":
                const { status } = await getSession(req, res, true);
                if (!status) {
                    throw new Error("You are not authenticated!");
                }
                const inputData = await validateCampaignAdData(req, res)
                const result = await campaignAdModel.insert(inputData);
                res.status(200).json({
                    status: 'success',
                    message: "",
                    data: {
                        id: result._id
                    }
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

export const validateCampaignAdData = async (req: NextApiRequest, res: NextApiResponse, id: string = "") => {
    const campaignAdModel = new CampaignAd(req, res);
    const campaignAd: any = id ? await campaignAdModel.find(id) : false;
    const parseData: any = await new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            if (err) reject({ err });
            else resolve({ fields, files });
        });
    });
    let filePath = "";
    let fileType = "";
    if (!campaignAd || typeof parseData.files.file != "undefined") {
        filePath = await saveFile(parseData.files.file, 'ads', '/uploads/campaigns')
        fileType = parseData.files.file.mimetype.split('/')[0] || "image"; 
    }
    console.log(filePath, fileType)
    let formData = parseData.fields;
    if(typeof formData == "object" && Object.keys(formData).length) {
        const validateRes = await validateCampaignAdForm(formData);
        if(validateRes.status) {
            const campaignGroupModel = new CampaignGroup(req, res);
            const group = await campaignGroupModel.createOrFind(formData.group);
            formData = validateRes.data;

            let inputData: any = {
                name: formData.name,
                group_id: group.id,
                title: formData.title,
                description: formData.description,
                button_text: formData.button_text,
                redirect_url: formData.redirection_link,
                amount: formData.bid_price,
                balance: formData.bid_price,
                nfts: Boolean(formData.customAds) == true && typeof formData.nfts == "object" && formData.nfts.length ? formData.nfts : [],
                status: formData.status || "draft"
            }
            if(!id) {
                inputData.showed = false;
            }
            if(filePath) {
                if(campaignAd) {
                    await removeFile(campaignAd.file);
                }
                inputData.file = filePath;
                inputData.file_type = fileType;
            }
            return inputData;
        } else {
            throw new Error(validateRes.errors.shift());
        }
    }
    throw new Error('Form data must be required!');

}