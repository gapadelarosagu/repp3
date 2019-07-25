const router = require('express').Router();

module.exports = (wagner) => {
    
    const UsuarioCtrl = wagner.invoke((Usuario) => 
        require('../controllers/usuario.controller')(Usuario));

    router.post('/', (req, res) => UsuarioCtrl.createUser(req, res));

          
    router.get('/', (req, res) => UsuarioCtrl.findAll(req, res));

    router.get('/login/:email/:password', (req, res) =>UsuarioCtrl.login(req, res));


    router.put('/:id', (req, res) => UsuarioCtrl.Actualizar(req, res));

    router.delete('/:id', (req, res) => UsuarioCtrl.Eliminar(req, res));

    router.get('/:id', (req, res) => UsuarioCtrl.findById(req, res));
    
    return router;
};