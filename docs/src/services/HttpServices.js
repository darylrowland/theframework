const APPLICATION_JSON_CONTENT_TYPE = "application/json";
const TOKEN_KEY = "token";
const STATUS_CODE_OK = 200;
const STATUS_UNAUTHORISED = 401;

var BASE_URL = "";

if (process && process.env && process.env.NODE_ENV === "development") {
    BASE_URL = "http://localhost:4242";
    console.log("🏗 In development mode");
}

export default {

    token: null,

    getBaseUrl() {
        return BASE_URL;
    },

    async getToken() {
        if (this.token) {
            return this.token;
        }

        try {
            const token = localStorage[TOKEN_KEY]
            this.token = token;
            return token;
        } catch (e) {
            return null;
        }
    },

    setToken(token) {
        this.token = token;
        localStorage[TOKEN_KEY] = token;
    },

    async createHeaders() {
        var headers = {
            "Content-Type": APPLICATION_JSON_CONTENT_TYPE
        };

        var token = await this.getToken();

        if (token) {
            headers["x-user-token"] = token;
        }

        return headers;
    },

    async loadFileFromUrl(url) {
        let res = await fetch(url, {
            method: "GET",
        });
        
        return await res.blob();
    },

    async uploadFile(url, method, fileUrl, contentType) {
        let file = await this.loadFileFromUrl(fileUrl)

        try {
            let res = await fetch(url, {
                method: method,
                body: file,
                headers: {"content-type": contentType || "image/png"}
            });

            if (!res || !res.status || res.status !== 200) {
                console.log(res);
                throw Error("Could not upload");
            }
        } catch (e) {
            this.handleUnexpectedError(e);
        }
    },


    async get(url) {
        var res;

        try {
            res = await fetch(BASE_URL + url, {
                method: 'GET',
                headers: await this.createHeaders()
            });

            // Get data back
            const data = await res.json();

            // Check data for errors
            if (data.error) {
                throw data.error;
            }

            if (res.status !== STATUS_CODE_OK) {
                if (Array.isArray(data)) {
                    if (data.length > 0 && data[0].error) {
                        throw Error(data[0].error);
                    }
                }

                throw Error("Unexpected Error")
            }

            return data;

        } catch (e) {
            this.handleUnexpectedError(e, res);
        }

    },

    async delete(url, body) {
        return await this.run(url, body, "DELETE");
    },

    async post(url, body) {
        return await this.run(url, body, "POST");
    },

    async run(url, body, method) {
        var res;

        try {
            res = await fetch(BASE_URL + url, {
                method: method,
                headers: await this.createHeaders(),
                body: JSON.stringify(body)
            });

            // Get data back
            const data = await res.json();

            // Check data for errors
            if (data.error) {
                throw data.error;
            }

            if (res.status !== STATUS_CODE_OK) {
                if (Array.isArray(data)) {
                    if (data.length > 0 && data[0].error) {
                        throw Error(data[0].error);
                    }
                }

                throw Error("Unexpected Error")
            }


            return data;  

        } catch (e) {
            this.handleUnexpectedError(e, res);
        }
    },

    stringifyNoQuotes(obj) {
        var jsonStr = JSON.stringify(obj);
        // eslint-disable-next-line
        return jsonStr.replace(/\"([^(\")"]+)\":/g,"$1:"); 
    },

    stringifyAndEscape(obj) {
        var jsonStr = JSON.stringify(obj);
        return JSON.stringify(jsonStr);
    },

    handleUnexpectedError(e, res) {
        if (res && res.status === STATUS_UNAUTHORISED) {
            // User isn't logged in
            if (this.onLoggedOutHandler) {
                this.onLoggedOutHandler();
            }
        } else {
            console.log(e);
            throw e.toString();
        }
    }


};