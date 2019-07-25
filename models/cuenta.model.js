    
const mongoose = require('mongoose');



let cuentaSchema = new mongoose.Schema({

    userId:{
        type :  mongoose.Schema.ObjectId
    },

    total: {
        type: Number
    },
    fechaUlt:{
        type: Date,
        default: Date.now
    },
    movimientos: [
        {
        cantidad:{
            type:Number
            },
        fecha:{
            type:Date,
            default:Date.now
            },
        desc:{
                type: String
            } 
        }
    ],
    categorias: [
        { nombre:{
            type:String
        },
            saldo:{
                type:Number
            },
            movimientos: [
                {
                cantidad:{
                    type:Number
                    },
                fecha:{
                    type:Date,
                    default:Date.now
                    },
                desc:{
                        type: String
                    } 
                }
            ]
        }
    ]
    
});

const cuendaModel = mongoose.model('Cuenta', cuentaSchema, 'cuentas');

module.exports = cuendaModel;