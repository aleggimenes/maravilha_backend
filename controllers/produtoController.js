const Produto = require('../models/produto')
const Requisicao = require('../models/requisicoes');
async function createProduto(req, res) {
    try {
        const { nome, quantidadeTotal } = req.body;
        const produto = await Produto.create({ nome, quantidadeTotal });
        return res.status(201).json({ produto })

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

async function getAllProduto(req, res) {
    try {
        // Obter todos os produtos
        const produtos = await Produto.findAll();

        // Iterar sobre cada produto
        for (const produto of produtos) {
            // Inicializar a quantidade reservada como 0
            let quantidadeReservada = 0;

            // Buscar todas as requisições associadas a este produto
            const requisicoes = await Requisicao.findAll({ where: { id_produto: produto.id } });

            // Iterar sobre cada requisição
            for (const requisicao of requisicoes) {
                // Verificar se a requisição é do tipo "Reserva" e se está pendente ou confirmada
                if (requisicao.tipo === 'Reserva' && (requisicao.status === 'Pendente')) {
                    // Adicionar a quantidade reservada desta requisição à quantidade total reservada
                    quantidadeReservada += requisicao.quantidade;
                }
            }

            // Adicionar a quantidade reservada ao objeto do produto
            produto.quantidadeReservada = quantidadeReservada;
        }

        // Mapear os produtos para retornar apenas os campos desejados
        const produtosFormatados = produtos.map(produto => ({
            id: produto.id,
            nome: produto.nome,
            quantidadeTotal: produto.quantidadeTotal,
            quantidadeReservada: produto.quantidadeReservada, // Adicionar o campo quantidadeReservada
            createdAt: produto.createdAt,
            updatedAt: produto.updatedAt
        }));

        return res.status(200).json(produtosFormatados);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function editarProduto(req, res) {
    try {
        const { produtoId } = req.params; // Obter o produtoId dos parâmetros da rota
        const { nome, quantidadeTotal } = req.body; // Novos dados do produto a serem atualizados

        // Encontra o produto pelo ID
        const produto = await Produto.findByPk(produtoId);

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        // Atualiza os dados do produto
        await produto.update({ nome, quantidadeTotal });

        return res.status(200).json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function retirarDoEstoque(req, res) {
    const { produtoId } = req.params; // Obter o produtoId dos parâmetros da rota
    const { quantidadeRetirada, pin } = req.body;

    try {
        // Encontra o produto pelo ID
        const produto = await Produto.findByPk(produtoId);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        if (pin != '1234') {
            return res.status(404).json({ error: 'Numero de pin inválido' });

        }
        // Verifica se há estoque suficiente
        if (produto.quantidadeTotal < quantidadeRetirada) {
            return res.status(400).json({ error: 'Estoque insuficiente' });
        }

        // Atualiza a quantidade total no estoque
        const novaQuantidade = produto.quantidadeTotal - quantidadeRetirada;
        await produto.update({ quantidadeTotal: novaQuantidade });

        return res.status(200).json({ message: 'Produto retirado do estoque com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function adicionarNoEstoque(req, res) {
    try {
        const { produtoId } = req.params; // Obter o produtoId dos parâmetros da rota
        const { quantidadeAdicionada } = req.body;

        // Encontra o produto pelo ID
        const produto = await Produto.findByPk(produtoId);

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        // Atualiza a quantidade total no estoque
        const novaQuantidade = produto.quantidadeTotal + quantidadeAdicionada;
        await produto.update({ quantidadeTotal: novaQuantidade });

        return res.status(200).json({ message: 'Produto adicionado ao estoque com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function deletarProduto(req, res) {
    try {
        const { produtoId } = req.params; // Obter o produtoId dos parâmetros da rota

        // Encontra o produto pelo ID
        const produto = await Produto.findByPk(produtoId);

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        // Remove o produto do banco de dados
        await produto.destroy();

        return res.status(200).json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
module.exports = {
    createProduto,
    getAllProduto,
    retirarDoEstoque,
    adicionarNoEstoque,
    editarProduto,
    deletarProduto
}