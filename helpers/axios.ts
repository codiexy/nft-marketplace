
import axios from "axios";
import { APP_BASE_URL } from "utils";


export const getBaseUrl = (url: string = "") => {
    let baseURL = APP_BASE_URL.trim() || "";
    url = typeof url === "string" ? url.trim() : "";
    baseURL = baseURL.slice(-1) === "/" ? baseURL : `${baseURL}/`;
    return url.charAt(0) == "/" ? `${baseURL}${url.substring(1)}` : `${baseURL}${url}`;
}

export const axiosInstance = axios.create({
    baseURL: getBaseUrl("/"),
    // timeout: 1000,
    headers: {
        "content-type": "application/json",
        accept: "application/json"
    }
});

export default {
    axiosInstance,
    getBaseUrl
}