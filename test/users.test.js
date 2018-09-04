const chai = require('chai'),
  dictum = require('dictum.js'),
  sessionManager = require('../app/services/sessionManager'),
  server = require('./../app'),
  should = chai.should();

const authenticate = email => {
  return chai
    .request(server)
    .post('/users/sessions')
    .send({ email, password: 'password1234' });
};

describe('users', () => {
  describe('/users POST', () => {
    it('should be successful', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'pass1234',
          email: 'user@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.have.property('firstName');
          res.body.should.have.property('lastName');
          res.body.should.have.property('email');
          res.body.should.have.property('password');
          dictum.chai(res);
        })
        .then(() => done());
    });
    it('should fail because password is missing', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          username: 'username',
          email: 'user@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal('"password" is required');
        })
        .then(() => done());
    });
    it('should fail because email is not valid', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password123',
          email: 'email'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal('"email" must be a valid email');
        })
        .then(() => done());
    });
    it('should fail because email is not from Wolox', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password123',
          email: 'email@other.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal(
            '"email" with value "email@other.com.ar" fails to match the Wolox e-mail pattern'
          );
        })
        .then(() => done());
    });
    it('should fail because password is not alphanumeric', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password',
          email: 'email@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal(
            '"password" with value "password" fails to match the Alphanumeric pattern'
          );
        })
        .then(() => done());
    });
    it('should fail because password is shorter than 8 characters', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: '123abc',
          email: 'email@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal('"password" length must be at least 8 characters long');
        })
        .then(() => done());
    });
    it('should fail because email already exist', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'firstName',
          lastName: 'lastName',
          password: 'password1234',
          email: 'joe.doe@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(409);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message.should.be.equal("E-mail 'joe.doe@wolox.com.ar' already registered");
        })
        .then(() => done());
    });
  });
  describe('/users/sessions POST', () => {
    it('should be successful', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({
          password: 'password1234',
          email: 'joe.doe@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.headers.should.have.property(sessionManager.HEADER_NAME);
          sessionManager
            .decode(res.headers[sessionManager.HEADER_NAME])
            .should.be.equal('joe.doe@wolox.com.ar');
          dictum.chai(res);
        })
        .then(() => done());
    });
    it('should fail because mail is not valid', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({
          password: 'password1234',
          email: 'email@other.com'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal(
            '"email" with value "email@other.com" fails to match the Wolox e-mail pattern'
          );
        })
        .then(() => done());
    });
    it('should fail because password is invalid', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({
          password: 'short12',
          email: 'joe.doe@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message[0].message.should.be.equal('"password" length must be at least 8 characters long');
        })
        .then(() => done());
    });
    it('should fail because email does not exist', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({
          password: 'password1234',
          email: 'not.exist@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message.should.be.equal('Cannot find user not.exist@wolox.com.ar!');
        })
        .then(() => done());
    });
    it('should fail because email or password are incorrect', done => {
      chai
        .request(server)
        .post('/users/sessions')
        .send({
          password: '123notcorrect',
          email: 'joe.doe@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(400);
          res.should.be.json;
          res.body.should.have.property('message');
          res.body.should.have.property('internal_code');

          res.body.message.should.be.equal('Email or password are incorrect!');
        })
        .then(() => done());
    });
  });
  describe('/admin/users POST', () => {
    it('should be successful with existing user request and using authenticated admin user', done => {
      authenticate('admin.user@wolox.com.ar').then(({ headers }) => {
        chai
          .request(server)
          .post('/admin/users')
          .set(sessionManager.HEADER_NAME, headers[sessionManager.HEADER_NAME])
          .send({
            firstName: 'Joe',
            lastName: 'Doe',
            password: 'password1234',
            email: 'joe.doe@wolox.com.ar'
          })
          .then(res => {
            res.should.have.status(200);
            dictum.chai(res);
          })
          .then(() => done());
      });
    });
    it('should be successful with non-existing user request and using authenticated admin user', done => {
      authenticate('admin.user@wolox.com.ar').then(({ headers }) => {
        chai
          .request(server)
          .post('/admin/users')
          .set(sessionManager.HEADER_NAME, headers[sessionManager.HEADER_NAME])
          .send({
            firstName: 'Anna',
            lastName: 'Rose',
            password: 'password1234',
            email: 'anna.rose@wolox.com.ar'
          })
          .then(res => {
            res.should.have.status(201);
            dictum.chai(res);
          })
          .then(() => done());
      });
    });
    it('should fail using authenticated normal user', done => {
      authenticate('joe.doe@wolox.com.ar').then(({ headers }) => {
        chai
          .request(server)
          .post('/admin/users')
          .set(sessionManager.HEADER_NAME, headers[sessionManager.HEADER_NAME])
          .send({
            firstName: 'Anna',
            lastName: 'Rose',
            password: 'password1234',
            email: 'anna.rose@wolox.com.ar'
          })
          .then(res => {
            res.should.have.status(403);
            dictum.chai(res);
          })
          .then(() => done());
      });
    });
    it('should fail non-authenticated request', done => {
      chai
        .request(server)
        .post('/admin/users')
        .send({
          firstName: 'Anna',
          lastName: 'Rose',
          password: 'password1234',
          email: 'anna.rose@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(401);
          dictum.chai(res);
        })
        .then(() => done());
    });
    it('should fail using a invalid token', done => {
      chai
        .request(server)
        .post('/admin/users')
        .set(sessionManager.HEADER_NAME, 'non-valid-hash')
        .send({
          firstName: 'Anna',
          lastName: 'Rose',
          password: 'password1234',
          email: 'anna.rose@wolox.com.ar'
        })
        .then(res => {
          res.should.have.status(401);
          dictum.chai(res);
        })
        .then(() => done());
    });
  });
});
