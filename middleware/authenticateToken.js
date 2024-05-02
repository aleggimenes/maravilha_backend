const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token de acesso inválido' });
        }
        req.userId = decoded.userId;
        next();
    });
}

module.exports = authenticateToken;