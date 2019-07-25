const status = require('http-status');
let _cuenta;

//consultar cuenta por id de usuario
const cuentaUs = (req,res) =>{
    const { userId } = req.params;
    const params = {
        userId: userId
    };
    _usuario.findOne(params)
        .then((data)=> {
            res.status(200);
            res.json({ data: data});
        })
        .catch((err)=> {
            res.status(400);
            res.json({msg:"Error!!!!", data:err});
        })
}

//inicializar la cuenta
const inicializarCuenta = (req,res) =>{ 
    const cuenta = req.body;
    //se borra la cuenta anterior al inicializar una nueva
   cuenta.userId = req.params.userId ;
    cuenta.movimientos = [
        {
        cantidad:cuenta.total,
        fecha:Date.now(),
        desc:'Inicializacion'
        }];
    
    cuenta.categorias = {
            saldo:
                cuenta.total
            ,
            nombre:'Sin Asignar',
            movimientos: [
                {
                cantidad:cuenta.total,
                fecha:Date.now(),
                desc:'Inicializacion'
                }
            ]
        };
    _cuenta.create(cuenta)
        .then((data)=> {
            res.status(200);
            res.json({msg:"Cuenta inicializada correctamente", data: data});
        })
        .catch((err)=> {
            res.status(400);
            res.json({msg:"Error!!!!", data:err});
        })
}

//consultar todas las categorias con su saldo
const catGet = (req,res) =>{
    _cuenta.find({ userId : req.params.userId}).populate('movimientos').populate('categorias.movimientos')
        .then((data)=> {
            res.status(200);
            res.json({ data: data});
        })
        .catch((err)=> {
            res.status(400);
            res.json({msg:"Error!!!!", data:err});
        })
}


//crear nueva categoria
const crearCategoria = (req,res) =>{
    categoriaExistente(req.params.nom,req.params.userId).then(existe=>{
        if(!existe){
        validarSaldos(req.params.userId).then(total=>{
            if(total>=req.params.saldo){
                _cuenta.update({userId:req.params.userId},{ $push : 
                    {categorias: 
                        { nombre :req.params.nom,
                        saldo: req.params.saldo,
                        movimientos: [
                            {
                                cantidad:req.params.saldo,
                                fecha:Date.now(),
                                desc:'Inicializacion'
                            }
                        ]
                    } }} )
                    .then((data)=> {
                        const men = (req.params.saldo)*(-1);
                        _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":"Sin Asignar"} ,{$inc:{"categorias.$.saldo":men}})
                            .then((data)=> {
                                res.status(200);
                                res.json({msg:"Se ha generado la categoria", data: data});
                            })
                            .catch((err)=> {
                                res.status(400);
                                res.json({msg:"Error!!!!"});
                            })  
                        
                    })
                    .catch((err)=> {
                        res.status(400);
                        res.json({msg:"Error!!!!", data:err});
                    })
            }
            else{
                res.status(400);
                res.json({msg:"No hay suficiente saldo para crear la categoria"});
            }
    })}else{
        res.status(400);
        res.json({msg:`La categoria ${req.params.nom} ya existe.`});
    }
});   
};

//eliminar categoria creada
const eliminarCategoria = (req,res) =>{
    if(!(req.params.nom==="Sin Asignar")){
    _cuenta.findOne({userId:req.params.userId,"categorias.nombre":req.params.nom},{"categorias.$":1}).then((data)=>{
        //res.json(data.categorias[0].saldo)
        _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":"Sin Asignar"} ,{$inc:{"categorias.$.saldo":data.categorias[0].saldo}})
        .then((data1)=> {
            try{
                _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":"Sin Asignar"}, { $push : 
                    {"categorias.$.movimientos": 
                            {
                                cantidad:data.categorias[0].saldo,
                                fecha:Date.now(),
                                desc:"Eliminacion de categoria "+req.params.nom
                            }
                    }
                    }).then(data2=>{
                        _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":req.params.nom} ,{$pull:{categorias:{nombre:req.params.nom}}})
                        .then((data)=> {
                            res.status(200);
                            res.json({msg:"Se ha eliminardo la categoria",data:data2});
                        })
                        .catch((err)=> {
                            res.status(400);
                            res.json({msg:"Error!!!"});
                        }); 
                    });
            }catch(e){
                console.log(e);
                res.json({msg:"Error!!!"});
            }
        })
        .catch((err)=> {
            res.status(400);
            res.json({msg:"Error!!!"});
        });   
    })
    .catch((err)=> {
        res.status(400);
        res.json({msg:"Error!!!"});
    });
    
} else{
        res.json({msg:"No se puede eliminar la categoria 'Sin Asignar'!!!!"});
    }
}

//restar cantidad a monto total
const restartTotal = (req,res) =>{

    const men = (-1)* (req.params.cant);
    _cuenta.update({userId:req.params.userId}, {$inc:{total:men } })
    .then((data)=> {
                    
        _cuenta.update( {userId:req.params.userId},{ $push : 
            {movimientos: 
                    {
                        cantidad:men,
                        fecha:Date.now(),
                        desc:req.body.desc
                    }
                }
                } )
            .then((data)=> {
                const men = (req.params.cant)*(-1);
                _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":"Sin Asignar"} ,{$inc:{"categorias.$.saldo":men}})
                    .then((data)=> {
                        res.status(200);
                        res.json({msg:"Se ha actualizado el saldo total",data:data });
                            
                    })
                    .catch((err)=> {
                        res.status(400);
                        res.json({msg:"Error!!!!"});
                    })  
                 
            }).catch((err)=> {
                res.status(400);
                res.json({msg:"Error!!!!"});
            }) 
    })
    .catch((err)=> {
        res.status(400);
        res.json({msg:"Error!!!!"});
    })  
}

//agregar cantidad a monto total
const agregarTotal = (req,res) =>{
    _cuenta.updateOne({userId : req.params.userId}, {$inc:{total:req.params.cant } })
    .then((data)=> {
        _cuenta.update( {userId : req.params.userId},{ $push : 
            {movimientos: 
                    {
                        cantidad:req.params.cant,
                        fecha:Date.now(),
                        desc:req.body.desc
                    }
                }
                } )
            .then((data)=> {
                const men = (req.params.cant);
                _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":"Sin Asignar"} ,{$inc:{"categorias.$.saldo":men}})
                    .then((data)=> {
                        res.status(200);
                        res.json({msg:"Se ha actualizado el saldo total",data:data });
                            
                    })
                    .catch((err)=> {
                        res.status(400);
                        res.json({msg:"Error!!!!"});
                    })  
                 
            })

    })
    .catch((err)=> {
        res.status(400);
        res.json({msg:"Error!!!!"});
    })  
}

//restar cantidad a categoria
const restarCategoria = (req,res) =>{
    categoriaExistente(req.params.nom,req.params.userId).then(existe=>{
        if(existe) {
            if (req.params.cant >= 0) {
                const men = (req.params.cant) * (-1);
                _cuenta.findOne({
                    userId: req.params.userId,
                    "categorias.nombre": req.params.nom
                }, {"categorias.$": 1}).then((data) => {
                    if ((data.categorias[0].saldo + men) < 0) {
                        res.status(400);
                        res.json({msg: "La categoria no puede quedar con saldo negativo"});
                    }
                    else {
                        _cuenta.updateOne({
                            userId: req.params.userId,
                            "categorias.nombre": req.params.nom
                        }, {$inc: {"categorias.$.saldo": men}})
                            .then((data) => {
                                _cuenta.update({userId: req.params.userId, "categorias.nombre": req.params.nom}, {
                                    $push:
                                        {
                                            "categorias.$.movimientos":
                                                {
                                                    cantidad: men,
                                                    fecha: Date.now(),
                                                    desc: req.body.desc
                                                }
                                        }
                                }).then((data) => {
                                    /*
                                                    const men = (req.params.cant)*(-1);
                                                    _cuenta.updateOne({userId:req.params.userId,"categorias.nombre":"Sin Asignar"} ,{$inc:{"categorias.$.saldo":men}})
                                                        .then((data)=> {
                                                            res.status(200);
                                                            res.json({msg:"Se ha actualizado el saldo total",data:data });
                                                        })
                                                        .catch((err)=> {
                                                            res.status(400);
                                                            res.json({msg:"Error!!!!"});
                                                        })   */
                                    _cuenta.updateOne({userId: req.params.userId}, {$inc: {total: men}})
                                        .then((data) => {
                                            res.status(200);
                                            res.json({
                                                msg: `Se ha actualizado el saldo de ${req.params.nom}`,
                                                data: data
                                            });
                                        }).catch((err) => {
                                        res.status(400);
                                        res.json({msg: "Error!!!!"});
                                    })
                                }).catch((err) => {
                                    res.status(400);
                                    res.json({msg: "Error!!!!"});
                                });
                            }).catch((err) => {
                            res.status(400);
                            res.json({msg: "Error!!!!"});
                        })
                    }
                });
            } else {
                res.status(400);
                res.json({msg: `No se permiten numeros negativos`});
            }
        }
        else {
            res.status(400);
            res.json({msg: `La categoria ${req.params.nom} no existe.`});
        }
})
}

//agregar cantidad a categoria
const agregarCategoria = (req,res) =>{
    if (req.params.cant>=0) {
        categoriaExistente(req.params.nom, req.params.userId).then(existe => {
            if (existe) {
                validarSaldos(req.params.userId).then(total => {
                    if (total >= req.params.cant) {
                        _cuenta.updateOne({
                            userId: req.params.userId,
                            "categorias.nombre": req.params.nom
                        }, {$inc: {"categorias.$.saldo": req.params.cant}})
                            .then((data) => {
                                _cuenta.updateOne({userId: req.params.userId, "categorias.nombre": req.params.nom}, {
                                    $push:
                                        {
                                            "categorias.$.movimientos":
                                                {
                                                    cantidad: req.params.cant,
                                                    fecha: Date.now(),
                                                    desc: req.body.desc
                                                }
                                        }
                                }).then((data) => {
                                    const men = (req.params.cant) * (-1);
                                    _cuenta.updateOne({
                                        userId: req.params.userId,
                                        "categorias.nombre": "Sin Asignar"
                                    }, {$inc: {"categorias.$.saldo": men}})
                                        .then((data) => {
                                            res.status(200);
                                            res.json({
                                                msg: `Se ha actualizado el saldo de${req.params.nom}`,
                                                data: data
                                            });

                                        })
                                        .catch((err) => {
                                            res.status(400);
                                            res.json({msg: "Error!!!!"});
                                        })
                                }).catch((err) => {
                                    res.status(400);
                                    res.json({msg: "Error!!!!"});
                                })
                            })
                            .catch((err) => {
                                res.status(400);
                                res.json({msg: "Error!!!!"});
                            })
                    }
                    else {
                        res.status(400);
                        res.json({msg: "No hay suficientes recursos para asignar"});
                    }
                }).catch((err) => {
                    res.status(400);
                    res.json({msg: "Error!!!!"});
                })
            }
            else {
                res.status(400);
                res.json({msg: `La categoria ${req.params.nom} no existe.`});
            }
        })
    }else{
        res.status(400);
        res.json({msg: "No se permiten cantidades negativas"});
    }
};


//consultar movimientos//

//consultar todos los movimientos dentro de categorias
const consultarMov = (req,res) =>{
    _cuenta.findOne({userId:req.params.userId}).select('categorias.movimientos')
    .then((data)=> {
    res.status(200);
    res.json({msg:`Movimientos de ${req.params.nom}`,data:data} );
})
.catch((err)=> {
    res.status(400);
    res.json({msg:"Error!!!!"});
})  
    
};

//consultar los movimientos de una categoria
const consultarMovCat = (req,res) =>{
    _cuenta.findOne({userId:req.params.userId},{categorias:{$elemMatch:{nombre:req.params.nom}}})
        .then((data)=> {
        res.status(200);
        res.json({msg:`Movimientos de ${req.params.nom}`,movimientos:data} );
    })
    .catch((err)=> {
        res.status(400);
        res.json({msg:"Error!!!!"});
    })  
}
 
//consultar los movimientos de Total
const consultarTotalMov = (req,res) =>{
    _cuenta.findOne({userId:req.params.userId}).select('movimientos')
        .then((data)=> {
        res.status(200);
        res.json({msg:`Movimientos de Total`,movimientos:data.movimientos} );
    })
    .catch((err)=> {
        res.status(400);
        res.json({msg:"Error!!!!"});
    })  
}

async function validarSaldos(uid){
    return await _cuenta.findOne({userId:uid,"categorias.nombre":"Sin Asignar"},{"categorias.$":1}).then(data=>{
        return data.categorias[0].saldo;
    });
}

async function categoriaExistente(cad,uid){
    return await _cuenta.findOne({userId:uid,"categorias.nombre":cad}).then(data=>{
        if(data)
            return true;
        return false;
    });
    }
    



module.exports = (Cuenta) => {
    _cuenta = Cuenta;
    return({
        cuentaUs,
        inicializarCuenta,
        crearCategoria,
        eliminarCategoria,
        agregarTotal,
        restartTotal,
        restarCategoria,
        agregarCategoria,
        consultarMov,
        consultarMovCat,
        consultarTotalMov,
        catGet

    });
}