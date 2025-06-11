import axios from "axios";
import { getBaseUrl } from "../helpers/axios";

export const getThemeSetting = async (options = {}) => {
    options = typeof options === "object" && options ? options : {};
    let result = await axios.get(getBaseUrl("/api/theme"), {
        params: options
    })
        .then(result => result.data.data.theme)
        .catch(error => {
            console.error(error)
            return [];
        });

    return result;
}

export const createThemeSetting = async (options = {}) => {
    options = typeof options === "object" && options ? options : {};
    let result = await axios.post(getBaseUrl("/api/theme"), options)
        .then(result => result.data)
        .catch(error => {
            console.error(error)
            return [];
        });
    return result;
}