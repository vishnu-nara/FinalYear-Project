// ---------------------------- IMPORTS ----------------------------
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = 8080;

const UserRoutes = require('./routes/UsersRoutes'); 
const SellerRoutes = require('./routes/SellersRoutes');
const ProductRoutes = require('./routes/ProductsRoutes')

// ---------------------------- MIDDLEWARE ----------------------------
app.use(cors({credentials: true, origin:"http://localhost:3000"}));
app.use(express.json({ limit: '10mb' }));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://Vishnu42:vishnu293@cluster0.xxxcwv4.mongodb.net/')
    .then(()=>{
        console.log('MongoDB is connected!');
        app.listen(port, () => {
            console.log(`App is listening at port ${port}`);
        });
    })
    .catch((err)=>{
        console.log(err)
    })

// ---------------------------- ROUTES ----------------------------
app.use('/user', UserRoutes);
app.use('/seller', SellerRoutes);
app.use('/product', ProductRoutes);
