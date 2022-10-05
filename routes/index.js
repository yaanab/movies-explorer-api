const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');
const { createUser, login, logout } = require('../controllers/users');
const { validateUserBody, validateAuthentication } = require('../middlewares/validations');

router.post('/signup', validateUserBody, createUser);
router.post('/signin', validateAuthentication, login);
router.get('/signout', logout);
router.use(auth);
router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use('/', (req, res, next) => {
  next(new NotFoundError('Запрос не найден'));
});

module.exports = router;
