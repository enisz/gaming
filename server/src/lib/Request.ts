import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export default class Request {

    private static axios: AxiosInstance = Axios.create();
    //private static axios: AxiosInstance = Axios.create({ baseURL: "http://localhost:3001"});

    public static get(url: string, body?: any): Promise<any> {
        const queryString: string[] = [];

        if(body) {
            for(let x in body) {
                queryString.push(x + "=" + body[x]);
            }
        }

        return Request.send("get", url + (body ? "?" + queryString.join("&") : ""));
    }

    /**
     * Sending POST request to the endpoint
     *
     * @param endpoint the endpoint
     * @param body payload
     */
    public static post(url: string, body?: any): Promise<any> {
        return Request.send("post", url, body);
    }

    /**
     * Sending the request
     * @param method The method to use
     * @param url The URL to send the request to
     * @param body The body of the request
     * @returns
     */
    private static send(method: "get" | "post" | "put" | "delete", url: string, body?: any): Promise<any> {
        const request: AxiosRequestConfig = {
            url: url,
            method: method,
            headers : {},
            data: body || undefined
        }

        if(sessionStorage.getItem("jwt") !== null) {
            request.headers.Authorization = `Bearer ${sessionStorage.getItem("jwt")}`
        }

        return this.axios.request(request);
    }

    ///**
    // * Sending GET request to the endpoint
    // *
    // * @param endpoint the endpoint
    // * @param params payload
    // */
    //public static get(url: string, body?: any): Promise<any> {
    //    const queryString: string[] = [];

    //    if(body) {
    //        for(let x in body) {
    //            queryString.push(x + "=" + body[x]);
    //        }
    //    }

    //    return Request.send("get", url + (body ? "?" + queryString.join("&") : ""));
    //}

    ///**
    // * Sending POST request to the endpoint
    // *
    // * @param endpoint the endpoint
    // * @param body payload
    // */
    //public static post(url: string, body: any): Promise<any> {
    //    return Request.send("post", url, body);
    //}

    ///**
    // * Sending DELETE request to the endpoint
    // *
    // * @param endpoint the endpoint
    // */
    //public static delete(url: string): Promise<any> {
    //    return Request.send("delete", url);
    //}

    ///**
    // * Sending PUT request to the endpoint
    // *
    // * @param endpoint the endpoint
    // * @param body payload
    // */
    //public static put(url: string, body: any): Promise<any> {
    //    return Request.send("put", url, body);
    //}

    ///**
    // * Sending the request
    // *
    // * @param method The request method
    // * @param url The URL
    // * @param body payload
    // */
    //private static send(method: 'post' | 'get' | 'put' | 'delete', url: string, body?: any): Promise<any> {
    //    return Got(url, {
    //        method : method,
    //        //headers : {
    //        //    "Authorization" : `Bearer ${Webex.getAccesToken()}`,
    //        //    "Content-Type" : "application/json"
    //        //},
    //        resolveBodyOnly: true,
    //        responseType: "json",
    //        body : body ? JSON.stringify(body) : undefined
    //    });
    //}
}