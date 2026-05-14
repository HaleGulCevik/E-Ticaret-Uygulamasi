const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); 


const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/eticaret';
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.log('MongoDB hatası:', err));


app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});


app.post('/api/orders', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        
        if (!product || product.stock < quantity) {
            return res.status(400).json({ message: 'Yetersiz stok veya geçersiz ürün' });
        }

        const totalPrice = product.price * quantity;
        const order = new Order({ productId, quantity, totalPrice });
        await order.save();

     
        product.stock -= quantity;
        await product.save();

        res.status(201).json({ message: 'Sipariş başarıyla oluşturuldu', order });
    } catch (error) {
        res.status(500).json({ message: 'Sipariş oluşturulamadı' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));