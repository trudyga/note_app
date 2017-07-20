'use strict';

module.exports = class Note {
    constructor(key,title, body) {
        this.key = key;
        this.title = title;
        this.body = body;
    }

    get JSON() {
        return JSON.stringify({
            key: this.key,
            title: this.title,
            body: this.body
        });
    }

    static fromJSON(jsonNote) {
        let data = JSON.parse(jsonNote);
        if (data && data.key && data.title && data.body)
            return new Note(data.key, data.title, data.body);
        throw new Error("Parse error");
    }
};