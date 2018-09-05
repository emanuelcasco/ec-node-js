const usersController = require('./controllers/users'),
  validations = require('./middlewares/validations'),
  auth = require('./middlewares/auth');

exports.init = app => {
  app.post('/users', [validations.userValidator], usersController.create);
  app.post('/users/sessions', [validations.signinValidator], usersController.signin);
  app.post(
    '/admin/users',
    [auth.authenticate, auth.isAdmin, validations.userValidator],
    usersController.createAdmin
  );
  app.get('/users', [auth.authenticate, validations.paginateValidator], usersController.getUsers);
};
