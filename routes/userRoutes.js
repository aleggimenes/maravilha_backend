// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para criar um novo usuário
router.post('/users', userController.createUser);

// Rota para listar todos os usuários
router.get('/users', userController.getAllUsers);

router.post('/login', userController.login);

router.get('/usersReq', userController.getAllUsersExceptManagers)
router.delete('/user/:id', userController.deleteUser);


module.exports = router;