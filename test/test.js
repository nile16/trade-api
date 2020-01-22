
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');
var token;
var balance;

chai.should();

chai.use(chaiHttp);

describe('API tests', () => {
    describe('OPTIONS /', () => {
        it('200 CORS Pre-flight', (done) => {
            chai.request(server)
                .options('/')
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.headers).to.have.property('content-type', 'application/json');
                    chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
                    chai.expect(res.headers).to.have.property('access-control-request-method', '*');
                    chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
                    chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
                    done();
                });
            })
    });

    describe('POST /', () => {
        it('200 Register user', (done) => {
            chai.request(server)
                .post('/')
                .send({
                    'cmd': 'reg',
                    'nam': 'Nils Leandersson',
                    'ema': 'nils@bth.se',
                    'psw': '1234'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.headers).to.have.property('content-type', 'application/json');
                    chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
                    chai.expect(res.headers).to.have.property('access-control-request-method', '*');
                    chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
                    chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
                    res.body.should.be.an("object");
                    chai.expect(res.body).to.have.property('err', false);
                    done();
                });
        });

        it('200 Login correct', (done) => {
            chai.request(server)
                .post('/')
                .send({
                    'cmd': 'lin',
                    'ema': 'nils@bth.se',
                    'psw': '1234'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.headers).to.have.property('content-type', 'application/json');
                    chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
                    chai.expect(res.headers).to.have.property('access-control-request-method', '*');
                    chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
                    chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
                    res.body.should.be.an("object");
                    chai.expect(res.body).to.have.property('err', false);
                    chai.expect(res.body).to.have.property('tok');
                    try {
                        token = res.body.tok;
                    } catch(err) {
                        token = false;
                    }
                    done();
                });
        });

        it('200 Login wrong password', (done) => {
            chai.request(server)
                .post('/')
                .send({
                    'cmd': 'lin',
                    'ema': 'nils@bth.se',
                    'psw': '12345'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.headers).to.have.property('content-type', 'application/json');
                    chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
                    chai.expect(res.headers).to.have.property('access-control-request-method', '*');
                    chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
                    chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
                    res.body.should.be.an("object");
                    chai.expect(res.body).to.have.property('err', 'Wrong password');
                    chai.expect(res.body).to.not.have.property('tok');
                    done();
                });
        });

        it('200 Login wrong email', (done) => {
            chai.request(server)
                .post('/')
                .send({
                    'cmd': 'lin',
                    'ema': 'nilss@bth.se',
                    'psw': '1234'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.headers).to.have.property('content-type', 'application/json');
                    chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
                    chai.expect(res.headers).to.have.property('access-control-request-method', '*');
                    chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
                    chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
                    res.body.should.be.an("object");
                    chai.expect(res.body).to.have.property('err', 'Email not registered');
                    chai.expect(res.body).to.not.have.property('tok');
                    done();
                });
        });

        it('200 Transfer funds deposit', (done) => {
            chai.request(server)
                .post('/')
                .send({
                    'cmd': 'tra',
                    'tok': token,
                    'typ': 'deposit',
                    'amt': '10000'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.expect(res.headers).to.have.property('content-type', 'application/json');
                    chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
                    chai.expect(res.headers).to.have.property('access-control-request-method', '*');
                    chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
                    chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
                    res.body.should.be.an("object");
                    chai.expect(res.body).to.have.property('err', false);
                    chai.expect(res.body).to.have.property('bal');
                    done();
                });
        });

        // it('200 Trade Buy', (done) => {
        //     chai.request(server)
        //         .post('/')
        //         .send({
        //             'cmd': 'trd',
        //             'tok': token,
        //             'stk': 'BTH',
        //             'num': 1
        //         })
        //         .end((err, res) => {
        //             res.should.have.status(200);
        //             chai.expect(res.headers).to.have.property('content-type', 'application/json');
        //             chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
        //             chai.expect(res.headers).to.have.property('access-control-request-method', '*');
        //             chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
        //             chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
        //             res.body.should.be.an("object");
        //             chai.expect(res.body).to.have.property('err', false);
        //             chai.expect(res.body).to.have.property('bal');
        //             chai.expect(res.body).to.have.property('shr');
        //             res.body.shr.should.be.an("object");
        //             done();
        //         });
        // });
        //
        // it('200 Get user Portfolio', (done) => {
        //     chai.request(server)
        //         .post('/')
        //         .send({
        //             'cmd': 'dat',
        //             'tok': token
        //         })
        //         .end((err, res) => {
        //             res.should.have.status(200);
        //             chai.expect(res.headers).to.have.property('content-type', 'application/json');
        //             chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
        //             chai.expect(res.headers).to.have.property('access-control-request-method', '*');
        //             chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
        //             chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
        //             res.body.should.be.an("object");
        //             chai.expect(res.body).to.have.property('err', false);
        //             chai.expect(res.body).to.have.property('bal');
        //             chai.expect(res.body).to.have.property('shr');
        //             res.body.shr.should.be.an("object");
        //             chai.expect(res.body.shr).to.have.property('BTH', 1);
        //             done();
        //         });
        // });
        //
        // it('200 Trade Sell', (done) => {
        //     chai.request(server)
        //         .post('/')
        //         .send({
        //             'cmd': 'trd',
        //             'tok': token,
        //             'stk': 'BTH',
        //             'num': -1
        //         })
        //         .end((err, res) => {
        //             res.should.have.status(200);
        //             chai.expect(res.headers).to.have.property('content-type', 'application/json');
        //             chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
        //             chai.expect(res.headers).to.have.property('access-control-request-method', '*');
        //             chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
        //             chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
        //             res.body.should.be.an("object");
        //             chai.expect(res.body).to.have.property('err', false);
        //             chai.expect(res.body).to.have.property('bal');
        //             chai.expect(res.body).to.have.property('shr');
        //             res.body.shr.should.be.an("object");
        //             try {
        //                 balance = res.body.bal;
        //             } catch(err) {
        //                 balance = 0;
        //             }
        //             done();
        //         });
        // });
        //
        // it('200 Transfer funds withdraw', (done) => {
        //     chai.request(server)
        //         .post('/')
        //         .send({
        //             'cmd': 'tra',
        //             'tok': token,
        //             'typ': 'withdraw',
        //             'amt': balance
        //         })
        //         .end((err, res) => {
        //             res.should.have.status(200);
        //             chai.expect(res.headers).to.have.property('content-type', 'application/json');
        //             chai.expect(res.headers).to.have.property('access-control-allow-origin', '*');
        //             chai.expect(res.headers).to.have.property('access-control-request-method', '*');
        //             chai.expect(res.headers).to.have.property('access-control-allow-methods', 'POST');
        //             chai.expect(res.headers).to.have.property('access-control-allow-headers', '*');
        //             res.body.should.be.an("object");
        //             chai.expect(res.body).to.have.property('err', false);
        //             chai.expect(res.body).to.have.property('bal');
        //             done();
        //         });
        // });

    });
});
