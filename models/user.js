'use strict';

const { DataTypes } = require('sequelize');
const db = require('../database/index');

const User = db.sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    employeeNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userType: {
        type: DataTypes.INTEGER, // Alteração para tipo inteiro
        allowNull: false,
        defaultValue: 0 // Defina o valor padrão, se necessário
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {});

module.exports = User;