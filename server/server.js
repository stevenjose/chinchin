const express = require('express')
const app = express()


app.use(require('./routes/web'));
 
app.listen(3000, ()=>{
  console.log('Escuchando por el puerto: ', 3000);
})



