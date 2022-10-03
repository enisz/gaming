import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export default class Request {

    private static axios: AxiosInstance = Axios.create();

    /**
     * Sending GET request
     *
     * @param url The url to send the request to
     * @param body The body of the request (will be sent as query parameters)
     * @returns The response
     */
    public static get(url: string, body?: any): Promise<any> {
        const queryString: string[] = [];

        if(body) {
            for(let index in body) {
                queryString.push(encodeURIComponent(index) + "=" + encodeURIComponent(body[index]));
            }
        }

        return Request.send("get", url + (body ? "?" + queryString.join("&") : ""));
    }

    /**
     * Sending POST request
     *
     * @param url The url to send the request to
     * @param body The body of the request
     * @returns The response
     */
    public static post(url: string, body?: any): Promise<any> {
        return Request.send("post", url, body);
    }

    /**
     * Sending DELETE request
     *
     * @param url The url to send the request to
     * @returns The response
     */
    public static delete(url: string): Promise<any> {
        return Request.send("delete", url);
    }

    /**
     * Sending PUT request
     *
     * @param url The url to send the request to
     * @param body The body of the request
     * @returns The response
     */
    public static put(url: string, body: any): Promise<any> {
        return Request.send("put", url, body);
    }

    /**
     * Sending the request
     * @param method The method to use
     * @param url The URL to send the request to
     * @param body The body of the request
     * @returns The response
     */
    private static send(method: "get" | "post" | "put" | "delete", url: string, body?: any): Promise<any> {
        const request: AxiosRequestConfig = {
            url: url,
            method: method,
            headers : {},
            data: body || undefined
        }

        const jwt = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

        if(jwt !== null) {
            request.headers.Authorization = `Bearer ${jwt}`
        }

        return this.axios.request(request);
    }

}