import { HttpHeaders, HttpParams } from "@angular/common/http";


export class RestApiRequestOptions {
    headers?: HttpHeaders;
    observe?: any = "body";
    params?: HttpParams;
    responseType?: any = "json";
}

export class RestApiOptions {
    pathParams?: { [key: string]: string };
    requestOptions?: RestApiRequestOptions;
    uncodeURi?: "encodeURI" | "encodeURIComponent";
}

export class RequestData {
    requestType?: string;
    url: string;
    body?: any;
    options?: RestApiOptions;
}