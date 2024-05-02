const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rota para retirar produtos do estoque
router.put('/produtos/:produtoId/retirar', produtoController.retirarDoEstoque);

router.put('/produtos/:produtoId/adicionar', produtoController.adicionarNoEstoque);
router.put('/produtos/:produtoId/editar', produtoController.editarProduto);
router.delete('/produtos/:produtoId', produtoController.deletarProduto);



// Rota para criar um novo produto
router.post('/produtos', produtoController.createProduto);

// Rota para listar todos os produtos
router.get('/produtos', produtoController.getAllProduto);

module.exports = router;
