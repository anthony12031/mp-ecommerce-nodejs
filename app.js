var express = require('express');
var exphbs  = require('express-handlebars');
require('dotenv').config();

var port = process.env.PORT || 3000

// SDK de Mercado Pago
const mercadopago = require ('mercadopago');
// Agrega credenciales
mercadopago.configure({
  access_token: process.env.MELI_ACCES_TOKEN,
  integrator_id: process.env.INTEGRATOR_ID
});

var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/success', function (req, res) {
    res.render('success', req.query);
});

app.get('/pending', function (req, res) {
    res.render('pending', req.query);
});

app.get('/failure', function (req, res) {
    res.render('failure', req.query);
});

app.get('/error', function (req, res) {
    res.render('error', req.query);
});

app.post('/meli-notification', function(req ,res) {
    console.log(JSON.stringify(req.body));
    res.status(201).send("created");
});

app.get('/detail', async function (req, res) {
    try {
        const preference = await createPreference(req.query);
        res.render('detail', {...req.query, preferenceId: preference.body.id, PUBLIC_KEY: process.env.PUBLIC_KEY});
    } catch(error) {
        res.status(500).send("error creating preference")
    }
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

async function createPreference({title, unit, price, img}) {
    const preference = {
        external_reference: "anthonyjasonvargassepulveda@gmail.com",
        notification_url: process.env.NOTIFICATION_URL,
        back_urls: {
            success: `${process.env.HOST}/success`,
            failure: `${process.env.HOST}/failure`,
            pending: `${process.env.HOST}/pending`
        },
        auto_return: "all",
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "amex"
                }
            ],
            excluded_payment_types: [
                {
                    id: "ticket"
                }
            ],
            installments: 6,
        },
        items: [
          {
            id: 1234,
            title,
            description: "Dispositivo móvil de Tienda e-commerce",
            picture_url: img,
            quantity: +unit,
            currency_id: 'COP',
            unit_price: +price
          }
        ],
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_83958037@testuser.com",
            date_created: new Date(),
            phone: {
                area_code: "57",
                number: 681094118
            },
            address: {
                street_name: "Insurgentes Sur",
                street_number: 1602,
                zip_code: "03940"
            }
      }
    };
    
  return mercadopago.preferences.create(preference).then(function (data) {
    return data;
    }).catch(function (error) {
        console.error(error);
       throw error;
    });
}