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
describe('/POST /ap1/v1/', () => {
    it('should send status 404', (done) => {
        chai.request(server)
            .post('/api/v1/')
            .send({ url: '../Images/Mario.png', upload: false, sequence: 'invert{}' })
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});