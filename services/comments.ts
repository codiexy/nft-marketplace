import axios from "axios";
import { getBaseUrl } from "helpers/axios";


export const saveComment = async (params = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results: any = await axios({
        method: 'POST',
        url: getBaseUrl(`api/comments`),
        data: params,
    })
        .then(result => result.data)
        .catch((error: any) => {
            const message = error?.response?.data?.message || error.message;
            console.error(message)
            return {
                status: "error",
                message
            };
        });

    return results;
}

export const getComments = async (nftId: any) => {
    let results: any = await axios({
        method: 'GET',
        url: getBaseUrl(`api/comments`),
        params: nftId,

    })
        .then((res: any) => res.data.data)
        .catch((error: any) => {
            const message = error?.response?.data?.message || error.message;
            return { status: "error", message };
        })


    return results;
}

export const deleteComment = async (id: any) => {
    return await axios({
        method: 'DELETE',
        url: getBaseUrl(`api/comments/${id}`)
    })
        .then(result => {
            return result.data.status == "success";
        })
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return false;
        });
}

export const updateComment = async (id: any, params = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results = await axios({
        method: 'PUT',
        url: getBaseUrl(`api/comments/${id}`),
        params: params
    })
        .then(result => result.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return {};
        });

    return results;
}


export const saveReplyComment = async (id: any, params = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results: any = await axios({
        method: 'POST',
        url: getBaseUrl(`api/comments/${id}/reply`),
        data: params,
    })
        .then(result => result.data)
        .catch((error: any) => {
            const message = error?.response?.data?.message || error.message;
            console.error(message)
            return {
                status: "error",
                message
            };
        });

    return results;
}

export const getReplyComment = async (id: any) => {
    let results: any = await axios({
        method: 'GET',
        url: getBaseUrl(`api/comments/${id}/reply`),
        params: id,

    })
        .then((res: any) => res.data.data)
        .catch((error: any) => {
            const message = error?.response?.data?.message || error.message;
            return { status: "error", message };
        })


    return results;
}

export const updateReplyComment = async (id: any, replyId: any, params = {}) => {
    params = typeof params === "object" && params ? params : {};
    let results = await axios({
        method: 'PUT',
        url: getBaseUrl(`api/comments/${id}/reply/${replyId}`),
        params: params
    })
        .then(result => result.data)
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return {};
        });

    return results;
}


export const deleteReplyComment = async (id: any, replyId: any) => {
    return await axios({
        method: 'DELETE',
        url: getBaseUrl(`api/comments/${id}/reply/${replyId}`)
    })
        .then(result => {
            return result.data.status == "success";
        })
        .catch(error => {
            console.error(error.response.data.message || error.message)
            return false;
        });
}