const sgMail=require('@sendgrid/mail');
const config=require('../_config');

sgMail.setApiKey(config.SENDGRID_APIKEY);

function enviar(msg){
    doijasdoiasdadoas
    msg["from"]=config.sender_email;
    sgMail.send(msg)
        .then(
            (data)=>{
                console.log("Éxito");
                console.log(data);
            }
        )
        .catch(
            (err)=>{
                console.log("Error");
                console.log(err);
            }
        );
}//sendmail

module.exports.send=enviar;
