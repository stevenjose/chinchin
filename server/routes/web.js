
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const api = '/api/chinchin'
const version = '1'
const binance = 'https://www.binance.com/exchange-api/v1/public/asset-service/product/get-products'
const coindesk = 'https://api.coindesk.com/v1/bpi/currentprice.json'
const axios = require('axios');
const { Client } = require('pg')

const BD = require('../conf/bd')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var valorBtc = 0

var valorETHBTC = 0

var valorDASH = 0

var BS = 0

var PRT = 0

var request = require('request');
const { json } = require('body-parser')

app.get('/', function (req, res) {
  res.send('Pagos Chinchin')
})


consultarModenasActivas();

// POST /login gets urlencoded bodies
app.post('/login', urlencodedParser, function (req, res) {
  res.send('welcome, ' + req.body.username)
})

// POST /api/intercambio
app.post(`${api}/${version}/intercambio`, jsonParser, function (req, res) {
  // create user in req.body

  let body = req.body;

  newFunction(body, res)

  axios
    .get(binance)
    .then(response => {
      let bitCointData = response.data.data;

      var CointData = []

      for (let country of Object.keys(bitCointData)) {
        CointData.push(bitCointData[country])
      }

      //console.log(CointData);

      CointData.forEach(element => {

        switch (element.s) {
          case "BTCUSDT":

            valorBtc = calcular(body.monto, element.l);

            break;
          case "ETHBTC":

            valorETHBTC = calcular(body.monto, element.l);

            break;

          case "DASHBTC":

            valorDASH = calcular(body.monto, element.l);

            break;

          default:
            break;
        }
      });

      if (BS > 0) {
        calcularBS(body.monto, BS)
      }

      if (PTR > 0) {
        console.log('PRICE', PTR);
        PTR = calcular(body.monto, PTR)
      }

      var valor = {
        BTC: valorBtc,
        ETH: valorETHBTC,
        DASH: valorDASH,
        BS,
        PTR
      }

      res.status(200).json({
        ok: true,
        monto: body.monto,
        data: valor

      })


    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })



})



function newFunction(body, res) {

  //res.send(body + ' 555 ');

  if (body === undefined) {
    res.status(400).json({
      ok: false,
      mensaje: 'El campos es requeridos *'
    })
  }

  if (body.monto === undefined) {
    res.status(400).json({
      ok: false,
      mensaje: 'El Monto es requerido'
    })

  }

  if (isNaN(body.monto)) {

    res.status(400).json({
      ok: false,
      mensaje: 'El Monto no es un digito' + body.monto
    })

  }

  if (body.moneda === undefined) {

    res.status(400).json({
      ok: false,
      mensaje: 'El la Moneda es requerido'
    })

  }

  if (body.moneda != 'USD') {
    res.status(400).json({
      ok: false,
      mensaje: 'La moneda debe de ser USD'
    })

  }
}

function calcular(monto, valor) {

  return monto / valor

}

function consultarModenasActivas() {
  BD.connect()
  BD.query('SELECT nombre,estatus,precio FROM monedas')
    .then(response => {
      //console.log(response.rows)

      data = response.rows

      data.forEach(element => {

        if (element.nombre == 'BS' && element.estatus == true) {
          BS = parseInt(element.precio);
          console.log('Precio BS: ', BS);
        }

        if (element.nombre == 'PTR' && element.estatus == true) {

          PTR = parseInt(element.precio);
          console.log('Precio PTR', PTR);
        }



      });

      BD.end()
    })
    .catch(err => {
      BD.end()
    })
}

function calcularBS(monto, valor) {

  BS = monto * valor;

}

module.exports = app;