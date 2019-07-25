const http = require('http');
const path = require('path');
const status = require('http-status');
const jwt = require('jsonwebtoken');
const _config = require('../_config');
let _usuario;

const createUser = (req, res) => {
    const usuario = req.body;

    _usuario.create(usuario)
        .then((data) => {
            res.status(200);
            res.json({
                msg: "Usuario creado ",
                data: data
            });
        })
        .catch((err) => {
            res.status(400);
            res.json({
                msg: "Error!!!!",
                data: err
            });
        })
}

const findAll = (req, res) => {
    _usuario.find()
        .then((data) => {
            if (data.length == 0) {
                res.status(status.NO_CONTENT);
                res.json({
                    msg: "No se encontraron usuarios"
                });
            } else {
                res.status(status.OK);
                res.json({
                    MST: "EXITO",
                    data: data
                })
            }
        })
        .catch((err) => {
            res.status(status.BAD_REQUEST);
            res.json({
                msg: " EXITO"
            });
        });
}



const login = (req, res) => {
    const { email, password } = req.params;
    let query = { email: email, password: password };
    _usuario.findOne(query, "-password")
        .then((usuario) => {
            if (usuario) {
                const token = jwt.sign({ email: email }, _config.SECRETJWT);
                res.status(status.OK);
                res.json({
                    msg: "Acceso exitoso",
                    data: {
                        usuario: usuario,
                        token: token
                    }
                });
            } else {
                res.status(status.NOT_FOUND);
                res.json({ msg: "Error!!! No se encontró" });
            }
        })
        .catch((err) => {
            res.status(status.NOT_FOUND);
            res.json({ msg: "Error!!! No se encontró", err: err });
        });
};

//encontrar por nombre
//const findById = (req, res) => {
 //   _user.findOne({},{/*usuarios:*/$elemMatch:{nombre:req.params.nom}})
 //   .then((data) =>{
  /*      res.status(200);
        res.json({msg:`Usuari@  ${req.params.nom}`,data:data});
    })
    .catch((err) => {
        res.status(400);
        res.json({msg:"Error!"});
    })
}
*/

// Buscar por ID
    const findById = (req, res) => {
        const { id } = req.params;
        const params = {
            _id: id
        };
        _usuario.findOne(params)
            .then((data) => {
                if (data.length == 0) {
                    res.status(status.NO_CONTENT);
                    res.json({ msg: "Usuario no encontrado" });
                } else {
                    res.status(status.OK);
                    res.json({ msg: "Éxito!!!", data: data });
                }
            })
            .catch((err) => {
                res.status(status.NO_CONTENT);
                res.json({ msg: "Error!!!" });
            });
    };

    //Actualizar por ID 

const Actualizar = (req, res) =>{
    const {id} = req.params;
    const usuario = req.body;

    _usuario.findByIdAndUpdate(id, usuario) 
      .then(data => {
          res.status(200);
          res.json({msg:"Exito"});
      })  
      .catch(err=> {
        res.status(404);
        res.json({msg:"Error"});
      })
    }


    const Eliminar = (req, res) =>{
        const {id} = req.params;
    
        _usuario.findByIdAndRemove(id) 
          .then(data => {
              res.status(200);
              res.json({msg:"Exito"});
          })  
          .catch(err=> {
            res.status(404);
            res.json({msg:"Error"});
          })
        }
    

module.exports = (Usuario) => {
    _usuario = Usuario;
    return ({
        createUser,
        findAll,
        Actualizar,
        Eliminar,
        findById,
        login
    });

};