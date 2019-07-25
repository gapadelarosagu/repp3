const mongoose = require('mongoose');

let usuarioSchema = new mongoose.Schema({
    nombre: {
        required: true,
        type: String
    },
    email: {
        type: String,
        lowercase: true,
        match: [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    }
});

const usuarioModel = mongoose.model('Usuario', usuarioSchema, 'usuarios');

module.exports = usuarioModel;