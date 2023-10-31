import express from 'express'
import paymentRoutes from './routes/payment.routes.js'

const app = express(); // declare express

app.use(paymentRoutes)

app.listen(3000);
console.log('Server on port ', 3000);