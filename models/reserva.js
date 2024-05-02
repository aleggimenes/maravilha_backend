'use strict';

const { DataTypes } = require("sequelize");
const db = require('../database/index')
const User = require('./user');
const Produto = require('./produto');

const Reserva = db.sequelize.define('Reservas', {
  produtoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantidadeReservada: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Definindo as associações
Reserva.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });
Reserva.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });

module.exports = Reserva;
