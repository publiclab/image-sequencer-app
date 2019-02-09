process.env.NODE_ENV = 'test';


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src');
let should = chai.should();
let path = require('path');

chai.use(chaiHttp);

/*
 * Test the /api/v1/process route for network image
 */
describe('/POST /ap1/v1/process', () => {
    it('should send status 200', (done) => {
        chai.request(server)
            .post('/api/v1/process')
            .send({ url: 'https://publiclab.org/system/images/photos/000/024/687/original/barataria.jpg', upload: false, sequence: 'invert{}' })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

/*
 * Test the /api/v1/process route for local image
 */
describe('/POST /ap1/v1/process', () => {
    it('should send status 200', (done) => {
        chai.request(server)
            .post('/api/v1/process')
            .send({ url: path.join(__dirname, '../Images/Mario.png'), upload: false, sequence: 'invert{}' })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

/*
 * Test the /api/v1/ route
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