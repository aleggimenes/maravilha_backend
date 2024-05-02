const express = require('express')
const router = express.Router()
const requisicaoController = require('../controllers/requisicaoController')

router.post('/requisicao', requisicaoController.createRequisicao);

router.get('/requisicao', requisicaoController.getAllRequisicao)

router.post('/requisicao/user/:usuarioId', requisicaoController.getRequisicoesUsuario);
router.post('/requisicao/user/history/:usuarioId', requisicaoController.getHistoricoRequisicoesUsuario);
router.get('/requisicao/user/history', requisicaoController.getAllHistoricoRequisicoes);



router.delete('/requisicao/:id', requisicaoController.deleteRequisicao);

router.put('/requisicao/:id/confirmar', requisicaoController.confirmarRequisicao)

router.put('/requisicao/:id', requisicaoController.updateRequisicao);

module.exports = router;