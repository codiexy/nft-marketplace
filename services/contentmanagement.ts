import axios from "axios";
import { getBaseUrl } from "../helpers/axios";

export const getContent = async (options = {}) => {
    options = typeof options === "object" && options ? options : {};
    let result = await axios.get(getBaseUrl("/api/contentmanagement"), {
        params: options
    })
        .then(result => result.data.data.content)
        .catch(error => {
            console.error(error)
            return [];
        });

    return result.map((data: any) => {
        const id = data._id;
        delete data._id;
        return {
            ...data,
            id: id
        }
    });
}

export const addContent = async (options = {}) => {
    options = typeof options === "object" && options ? options : {};
    let result = await axios.post(getBaseUrl("/api/contentmanagement"), options)
        .then(result => result.data)
        .catch(error => {
            console.error(error)
            return [];
        });
    return result;
}


export const deleteSelectItem = async (options = {}) => {
    options = typeof options === "object" && options ? options : {};
    let result = await axios.delete(getBaseUrl("/api/contentmanagement"), options)
        .then(result => result.data)
        .catch(error => {
            console.error(error)
            return [];
        });
    return result;
}


export const orderFormat = (data: any) => {
    if (data && Object.keys(data).length) {
        data.id = data._id;
        delete data.id;
        return data;
    }
    return {};
}