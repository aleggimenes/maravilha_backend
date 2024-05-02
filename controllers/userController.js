const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const saltRounds = 10; // Número de saltos para a geração do salt
const Requisicao = require('../models/requisicoes');



async function createUser(req, res) {
    try {
        const { name, employeeNumber, password, userType } = req.body;

        // Verifica se o userType é válido
        if (userType !== 1 && userType !== 2) {
            return res.status(400).json({ error: 'Tipo de usuário inválido' });
        }

        // Verifica se o número do funcionário (employeeNumber) tem 6 dígitos
        if (!/^\d{6}$/.test(employeeNumber)) {
            return res.status(400).json({ error: 'O número do funcionário deve ter 6 dígitos' });
        }

        // Verifica se o número do funcionário (employeeNumber) é único
        const existingUser = await User.findOne({ where: { employeeNumber } });
        if (existingUser) {
            return res.status(400).json({ error: 'Número de funcionário já em uso' });
        }

        // Criptografa a senha antes de armazená-la no banco de dados
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ name, employeeNumber, password: hashedPassword, userType });
        const token = jwt.sign({ userId: newUser.id }, 'secretKey');
        await newUser.update({ token });

        return res.status(201).json({ newUser, token });
    } catch (error) {
        console.log('error: ' + error);
        return res.status(500).json({ error: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
async function getAllUsersExceptManagers(req, res) {
    try {
        // Consulta para obter todos os usuários exceto os gerentes
        const users = await User.findAll({
            where: {
                userType: {
                    [Op.ne]: 1 // [Op.ne] significa "diferente de"
                }
            }
        });

        // Array para armazenar os resultados formatados
        const formattedUsers = [];

        // Loop através de cada usuário
        for (const user of users) {
            // Consulta para contar as requisições pendentes para o usuário atual
            const pendingRequestsCount = await Requisicao.count({
                where: {
                    usuarioId: user.id,
                    status: 'Pendente'
                }
            });

            // Adiciona o usuário formatado ao array
            formattedUsers.push({
                id: user.id,
                name: user.name,
                employeeNumber: user.employeeNumber,
                pendingRequestsCount: pendingRequestsCount
            });
        }

        return res.status(200).json(formattedUsers);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function login(req, res) {
    const { employeeNumber, password } = req.body;

    try {
        // Busca o usuário pelo número do colaborador
        const user = await User.findOne({ where: { employeeNumber } });

        // Verifica se o usuário existe e se a senha está correta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gera o token de acesso
        const token = jwt.sign({ userId: user.id }, 'secretKey');

        // Envie o token de volta para o cliente junto com as informações do usuário
        return res.status(200).json({ token, user });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao processar o login' });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario não encontrado' });
        }
        await user.destroy();
        return res.status(200).json({ message: 'Usuario deletado com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


module.exports = {
    createUser,
    getAllUsers,
    login,
    getAllUsersExceptManagers,
    deleteUser
}