import { assetUrl } from "helpers";
import { getBaseUrl } from "../helpers/axios";
import axios from "axios";

export const getCampaignAds = async (options = {}) => {
    options = typeof options === "object" && options ? options : {};
    let results = await axios.get(getBaseUrl("api/admin/campaigns/ads"), {
        params: options
    })
        .then(result => result.data.data.ads)
        .catch(error => {
            console.error(error.response?.data.message || error.message)
            return [];
        });

    return results.map((data: any) => formatCampaignData(data));
}

export const getCampaignAd = async (id: any) => {
    let result = await axios.get(
        getBaseUrl(`api/admin/campaigns/ads/${id}`)
    )
        .then(result => result.data.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return false;
        });
    return formatCampaignData(result);
}

export const saveCampaignAd = async (params = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results = await axios({
        method: 'post',
        url: getBaseUrl(`api/admin/campaigns/ads`),
        data: params
    })
        .then(result => result.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return {
                status: "error",
                message: error.message
            };
        });

    return results;
}

export const updateCampaignAd = async (id: any, params = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results = await axios({
        method: 'put',
        url: getBaseUrl(`api/admin/campaigns/ads/${id}`),
        data: params
    })
        .then(result => result.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return {};
        });

    return results;
}

export const deleteCampaignAd = async (id: any) => {
    return await axios({
        method: 'DELETE',
        url: getBaseUrl(`api/admin/campaigns/ads/${id}`)
    })
        .then(result => {
            return result.data.status == "success";
        })
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return false;
        });
}

export const getShowingAd = async () => {
    let result = await axios.get(
        getBaseUrl(`api/campaigns/ad`)
    )
        .then(result => result.data.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return false;
        });
    return formatCampaignData(result);
}

export const nftAdClickedOrViewed = async (id: string, params: any = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results = await axios({
        method: 'put',
        url: getBaseUrl(`api/campaigns/ads/${id}`),
        data: params
    })
        .then(result => result.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return {};
        });

    return results;
}

export const getWatchedAdPrice = async (nftId: string) => {
    let result = await axios.get(
        getBaseUrl(`api/campaigns/ads/nft/${nftId}`)
    )
        .then(result => result.data.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return false;
        });
    return result;
}

export const formatCampaignData = (data: any = false) => {
    if (typeof data == "object" && Object.keys(data).length) {
        data.file = assetUrl(data.file);
        return data;
    }
    return data;
}