const mongoose = require('mongoose');
const _ = require('underscore');
const config = require('../_config');

module.exports = (wagner) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb://localhost:27017/${config.DB}`, 
                    {useNewUrlParser:true});
    
    wagner.factory('db',()=>mongoose);
    const Cuenta = require('./cuenta.model');
    const Usuario = require('./usuario.model');

    const models = {
        Cuenta,
        Usuario
    }
    _.each(models,(v, k) => {
        wagner.factory(k, ()=>v);
    })

}