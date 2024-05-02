const Requisicao = require('../models/requisicoes');
const Produto = require('../models/produto');
const User = require('../models/user'); // Importe o modelo User
const { Op } = require('sequelize');

function generatePin() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createRequisicao(req, res) {
    try {
        const { usuarioId, id_produto, tipo, quantidade } = req.body;

        // Verificar se o usuário existe
        const usuario = await User.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar se o produto existe
        const produto = await Produto.findByPk(id_produto);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        // Verificar o tipo de requisição
        if (tipo === 'Reserva') {
            // Verificar se há quantidade suficiente disponível no estoque
            if (produto.quantidadeTotal < quantidade) {
                return res.status(400).json({ error: 'Quantidade insuficiente em estoque para a reserva' });
            }

            // Atualizar o estoque do produto
            produto.quantidadeTotal -= quantidade;
            await produto.save();
        }

        // Gerar PIN e criar a requisição
        const pin = generatePin();
        const novaRequisicao = await Requisicao.create({ usuarioId, status: 'Pendente', pin, tipo, quantidade, id_produto });

        return res.status(201).json(novaRequisicao);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function getAllRequisicao(req, res) {
    try {
        // Recuperar as requisições pendentes ordenadas por createdAt
        const requisicoesPendentes = await Requisicao.findAll({
            where: { status: 'Pendente' },
            order: [['createdAt', 'DESC']] // Ordenar por createdAt, do mais recente ao mais antigo
        });

        // Mapear cada requisição pendente para adicionar dados do usuário e do produto
        const requisicoesCompletas = await Promise.all(requisicoesPendentes.map(async (requisicao) => {
            // Carregar o nome do usuário associado à requisição
            const usuario = await User.findByPk(requisicao.usuarioId);
            const nomeUsuario = usuario ? usuario.name : null;

            // Carregar o nome do produto associado à requisição
            const produto = await Produto.findByPk(requisicao.id_produto);
            const nomeProduto = produto ? produto.nome : null;

            // Retornar a requisição com os dados do usuário e do produto
            return {
                ...requisicao.toJSON(),
                nomeUsuario,
                nomeProduto
            };
        }));

        return res.status(200).json(requisicoesCompletas);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}




async function getRequisicoesUsuario(req, res) {
    try {
        const { usuarioId } = req.params;

        // Verificar se o usuário existe
        const usuario = await User.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Buscar todas as requisições do usuário que somente está Pendente
        const requisicoes = await Requisicao.findAll({ where: { usuarioId, status: 'Pendente' } });
        return res.status(200).json(requisicoes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function getHistoricoRequisicoesUsuario(req, res) {
    try {
        const { usuarioId } = req.params;

        // Verificar se o usuário existe
        const usuario = await User.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Buscar todas as requisições do usuário com status diferente de "Pendente"
        const historicoRequisicoes = await Requisicao.findAll({
            where: {
                usuarioId,
                status: {
                    [Op.not]: 'Pendente' // [Op.not] significa "não igual a"
                }
            }
        });

        return res.status(200).json(historicoRequisicoes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function getAllHistoricoRequisicoes(req, res) {
    try {
        // Buscar todas as requisições com status diferente de "Pendente"
        const historicoRequisicoes = await Requisicao.findAll({
            where: {
                status: {
                    [Op.not]: 'Pendente' // [Op.not] significa "não igual a"
                }
            }
        });

        return res.status(200).json(historicoRequisicoes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function deleteRequisicao(req, res) {
    try {
        const { id } = req.params;
        const requisicao = await Requisicao.findByPk(id);
        if (!requisicao) {
            return res.status(404).json({ error: 'Requisição não encontrada' });
        }

        if (requisicao.tipo === 'Reserva') {
            // Verificar se o produto existe
            const produto = await Produto.findByPk(requisicao.id_produto);
            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            // Devolver a quantidade reservada ao estoque do produto
            produto.quantidadeTotal += requisicao.quantidade;
            await produto.save();
        }

        // Excluir a requisição
        await requisicao.destroy();

        return res.status(200).json({ message: 'Requisição deletada com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function confirmarRequisicao(req, res) {
    try {
        const { id } = req.params;
        const { pin, status } = req.body;

        // Encontrar a requisição pelo ID
        const requisicao = await Requisicao.findByPk(id);

        if (!requisicao) {
            return res.status(404).json({ error: 'Requisição não encontrada' });
        }

        // Verificar se o PIN fornecido está correto
        if (requisicao.pin !== pin) {
            return res.status(403).json({ error: 'PIN incorreto' });
        }

        // Verificar se a requisição é do tipo "Reserva" e se o novo status é "Cancelado"
        if (requisicao.tipo === 'Reserva' && status === 'Cancelado') {
            // Atualizar o estoque do produto adicionando a quantidade reservada
            const produto = await Produto.findByPk(requisicao.id_produto);
            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            produto.quantidadeTotal += requisicao.quantidade;
            await produto.save();

            requisicao.status = status;
            await requisicao.save();
            return res.status(200).json({ message: 'Status Cancelado' });
        }

        // Verificar se a requisição é do tipo "Reserva" e o novo status é "Confirmado"
        if (requisicao.tipo === 'Reserva' && status === 'Confirmado') {
            requisicao.status = status;
            await requisicao.save();
            return res.status(200).json({ message: 'Status Confirmado' });
        }

        // Atualizar o status da requisição para 'Confirmada' ou 'Cancelada'
        requisicao.status = status;
        await requisicao.save();

        // Se for uma compra, atualizar o estoque do produto
        if (requisicao.tipo === 'Compra' && status === 'Confirmado') {
            const produto = await Produto.findByPk(requisicao.id_produto);
            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            produto.quantidadeTotal += requisicao.quantidade;
            await produto.save();
        }

        return res.status(200).json({ message: 'Requisição confirmada' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function updateRequisicao(req, res) {
    try {
        const { id } = req.params;
        let { tipo, quantidade, id_produto } = req.body;

        const requisicao = await Requisicao.findByPk(id);
        if (!requisicao) {
            return res.status(404).json({ error: 'Requisição não encontrada' });
        }
        let qtde_atual_pedida = requisicao.quantidade;
        if (tipo === undefined) {
            tipo = requisicao.tipo
        } else {
            requisicao.tipo = tipo
        }
        if (quantidade === undefined) {
            quantidade = requisicao.quantidade
        } else {
            requisicao.quantidade = quantidade
        }
        if (id_produto === undefined) {
            id_produto = requisicao.id_produto
        } else {
            requisicao.id_produto = id_produto
        }
        // Verificar se o tipo da requisição é 'Reserva' e se há estoque suficiente
        if (tipo === 'Reserva' && quantidade != qtde_atual_pedida) {
            // Verificar se o produto existe
            const produto = await Produto.findByPk(id_produto);
            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            let diff = quantidade - qtde_atual_pedida
            if (produto.quantidadeTotal < quantidade) {
                return res.status(400).json({ error: 'Quantidade insuficiente em estoque para a reserva' });
            } else {
                produto.quantidadeTotal -= diff;
                await produto.save();
            }
        }

        // Salvar as alterações na requisição
        await requisicao.save();

        return res.status(200).json(requisicao);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}



module.exports = {
    createRequisicao,
    getAllRequisicao,
    deleteRequisicao,
    confirmarRequisicao,
    getRequisicoesUsuario,
    updateRequisicao,
    getHistoricoRequisicoesUsuario,
    getAllHistoricoRequisicoes
};
