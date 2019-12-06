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
describe('/GET /ap1/v1/process', () => {
    it('should send response', (done) => {
        chai.request(server)
            .get('/api/v1/process/?steps=[{input":"https://publiclab.org/system/images/photos/000/024/687/original/barataria.jpg","steps"="brightness"}]')
            .end((err, res) => {
                res.should.be.any;
                done();
            });
    });
});

/*
 * Test the /api/v1/export route for network image
 */
describe('/GET /ap1/v1/export', () => {
    it('should send response', (done) => {
        chai.request(server)
            .get('/api/v1/export/?url=https://mapknitter.org/maps/pvdtest/warpables.json')
            .end((err, res) => {
                res.should.be.any;
                done();
            });
    });
});
// describe('/GET /ap1/v2/process', () => {
//     it('should send response', (done) => {
//         chai.request(server)
//             .get('/api/v2/process/?steps=[{"id":1,input":"https://publiclab.org/system/images/photos/000/024/687/original/barataria.jpg","steps"="brightness"}]')
//             .end((err, res) => {
//                 res.should.be.any;
//                 done();
//             });
//     });
// });

/*
 * Test the /api/v2/export route for network image
 */
describe('/GET /ap1/v2/export', () => {
    it('should send response', (done) => {
        chai.request(server)
            .get('/api/v2/export/?url=https://mapknitter.org/maps/pvdtest/warpables.json&scale=5')
            .end((err, res) => {
                res.should.be.any;
                done();
            });
    });
});

/*
 * Test the /api/v2/export route with included non-remote JSON
 */
describe('/POST /ap1/v2/export with enclosed JSON image collection', () => {
    it('should send response', (done) => {
        // example JSON images collection as in spec at https://github.com/publiclab/mapknitter-exporter-sinatra#usage
        var json = [{"nodes":[
                {"lat":"41.8200378187","lon":"-71.4034409085"},
                {"lat":"41.8199873593","lon":"-71.4030021564"},
                {"lat":"41.8196229772","lon":"-71.4029728831"},
                {"lat":"41.8198214546","lon":"-71.4034614433"}
            ],
            "cm_per_pixel":23.0934,
            "src":"https://s3.amazonaws.com/grassrootsmapping/warpables/312455/test.png"},
            {"nodes":[
                {"lat":"41.819898342","lon":"-71.4035387139"},
                {"lat":"41.819898342","lon":"-71.4028493862"},
                {"lat":"41.8195005594","lon":"-71.4028493862"},
                {"lat":"41.8195005594","lon":"-71.4035387139"}
            ],
            "cm_per_pixel":35.8578,
            "src":"https://s3.amazonaws.com/grassrootsmapping/warpables/320983/test.png"}
        ];
        chai.request(server)
            .post('/api/v2/export/')
            .send({
                scale: 5,
                collection: json
            })
            .end((err, res) => {
                res.should.be.any;
                done();
            });
    });
});


/*
 * Test the /api/v2/ route
 */
// describe('/POST /ap1/v1/', () => {
//     it('should send status 404', (done) => {
//         chai.request(server)
//             .post('/api/v1/')
//             .send({ url: '../Images/Mario.png', upload: false, sequence: 'invert{}' })
//             .end((err, res) => {
//                 res.should.have.status(404);
//                 done();
//             });
//     });
// });
