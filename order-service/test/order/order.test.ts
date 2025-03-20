import { expect } from 'chai';
import request from "supertest";

describe('Index Test', function () {
    it('should always pass', function (done) {
        expect(true).to.equal(true);
        request(app).get("/").expect(200, done)
    });
});