process.env.NODE_ENV = 'test';


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src');
let should = chai.should();


chai.use(chaiHttp);

/*
 * Test the /api/v1/process route
 */
describe('/POST /ap1/v1/process', () => {
    it('should send status 200', (done) => {
        server.listen(8080, () => { });
        chai.request("http://localhost:8080")
            .post('/api/v1/process')
            .send({ url: '../Images/Mario.png', upload: false, sequence: 'invert{}' })
            .end((err, res) => {
                console.log(res.body.data.length);
                res.should.have.status(200);
                done();
            });
    });
});