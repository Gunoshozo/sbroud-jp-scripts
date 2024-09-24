import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RequestData, RestApiOptions } from "../models/rest.models";
import { Observable, of } from "rxjs";
import apiRoutes from "../consts/api.routes";
import { ImgLinkPipe } from "../pipes/img-link.pipe";

@Injectable()
export class RestApiService {
    constructor(private http: HttpClient) { }

    public get(urlName: string, options: RestApiOptions = {}): Observable<any> {
        return this.getRequestByType(
            {
                requestType: "get",
                url: urlName,
                body: null,
                options
            }
        )
    }

    private getRequestByType(data: RequestData): Observable<any> {
        const url = this.resolveUrl(data.url, data.options?.pathParams, data.options?.uncodeURi)
        let request = of<any>(null);
        switch (data.requestType) {
            case "get":
                request = this.http[data.requestType](url, data.options?.requestOptions);
                break;
        }
        return request;
    }

    private resolveUrl(url: string, pathParams?: { [key: string]: string }, encodeUri?: string): string {
        const path: string = apiRoutes.urls[url] ? apiRoutes.urls[url] : url;
        let resolvedPath = path;
        if (pathParams) {
            for (let entry of Object.entries(pathParams)) {
                resolvedPath = resolvedPath.replace(`{${entry[0]}}`, entry[1] || "")
            }
        }

        if (resolvedPath.includes("{assets}")){
            const pipe: ImgLinkPipe = new ImgLinkPipe();
            resolvedPath = pipe.transform(resolvedPath);
        }

        if (encodeUri === "encodeURIComponent") {
            return encodeURIComponent(resolvedPath)
        } else {
            return encodeURI(resolvedPath)
        }
    }
}