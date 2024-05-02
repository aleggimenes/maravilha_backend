const express = require('express');
const app = express();
const db = require('./database/index');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Importe as rotas do arquivo userRoutes
const produtosRoutes = require('./routes/produtosRoutes'); // Importe as rotas do arquivo userRoutes
const requisicaoRoutes = require('./routes/requisicaoRoutes')
// Define o middleware para tratar o corpo das requisições como JSON
app.use(express.json());
app.use(cors());
// Monta as rotas definidas no arquivo userRoutes no caminho '/api'
app.use('/api', userRoutes);
app.use('/api', produtosRoutes);
app.use('/api', requisicaoRoutes)


// Rota padrão
app.get('/', (req, res) => {
    res.send('Servidor está funcionando corretamente!');
});

// Define a porta do servidor
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});