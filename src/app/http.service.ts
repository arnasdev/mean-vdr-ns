import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class HttpService {
    constructor(private http: HttpClient) { }

    postData(url: string, data: any) {
        let options = this.createRequestOptions();
        return this.http.post(url, { data }, { headers: options });
    }

    putData(url: string) {
        let headers = this.createRequestHeader();
        return this.http.put(url, { headers: headers });
    }

    getData(url: string) {
        let headers = this.createRequestHeader();
        return this.http.get(url, { headers: headers });
    }

    deleteData(url: string) {
        let headers = this.createRequestHeader();
        return this.http.delete(url, { headers: headers });
    }

    private createRequestOptions() {
        let headers = new HttpHeaders({
            "Content-Type": "application/json"
        });
        return headers;
    }

    private createRequestHeader() {
        // set headers here e.g.
        let headers = new HttpHeaders({
            "AuthKey": "my-key",
            "AuthToken": "my-token",
            "Content-Type": "application/json",
         });

        return headers;
    }
}
