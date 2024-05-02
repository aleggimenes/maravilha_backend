// models/user.js
'use strict';
const { DataTypes } = require('sequelize');
const db = require('../database/index');

const Produto = db.sequelize.define('Produto', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantidadeTotal: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {});

module.exports = Produto;
