const router = require('express').Router();

module.exports = (wagner) => {
    
    const cuentaCtrl = wagner.invoke((Cuenta) => 
        require('../controllers/cuenta.controller')(Cuenta));

    ////////////////////total

    // se manda en el cuerpo el "total" de la cuenta raiz
    router.post('/:userId', (req, res) =>
    cuentaCtrl.inicializarCuenta(req, res));

    //se manda en el url la cantidad a agregar al total y en cuerpo se le manda desc(descripcion del movimiento)
    router.put('/:userId/agregar/:cant', (req, res) =>
    cuentaCtrl.agregarTotal(req, res));

    //se manda en el url la cantidad a restar al total y en cuerpo se le manda desc(descripcion del movimiento)
    router.put('/:userId/restar/:cant', (req, res) =>
    cuentaCtrl.restartTotal(req, res));
    
    //se consultan todos los movimientos en TOTAL
    router.get('/:userId/movimientos', (req, res) =>
    cuentaCtrl.consultarTotalMov(req, res));
    
    
    ////////////////////categorias

    //obtener todas las categorias con su saldo
    router.get('/:userId', (req, res) =>
    cuentaCtrl.catGet(req, res));

    //se manda en la url el nombre de la categoria a crea y despues el saldo a asignar
    router.put('/:userId/categorias/crear/:nom/:saldo', (req, res) =>
    cuentaCtrl.crearCategoria(req, res));

    //en la url se manda el parametro del nombre de la categoria a eliminar
    router.put('/:userId/categorias/eliminar/:nom', (req, res) =>
    cuentaCtrl.eliminarCategoria(req, res));

     //se manda en el url la el nombre de la categoria y cantidad a agregar 
    router.put('/:userId/categorias/agregar/:nom/:cant', (req, res) =>
    cuentaCtrl.agregarCategoria(req, res));

     //se manda en el url la el nombre de la categoria y cantidad a restar 
    router.put('/:userId/categorias/restar/:nom/:cant', (req, res) =>
    cuentaCtrl.restarCategoria(req, res));
    
    //se manda en la url el nombre de la categoria de la cual se van a consultar los movimientos
    router.get('/:userId/categorias/movimientos/:nom', (req, res) =>
    cuentaCtrl.consultarMovCat(req, res));

    // se solicitan todos los movimientos  de CATEGORIAS
    router.get('/:userId/categorias/movimientos', (req, res) =>
    cuentaCtrl.consultarMov(req, res));



    return router;
}