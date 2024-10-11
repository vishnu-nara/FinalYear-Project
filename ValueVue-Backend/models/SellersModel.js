const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellersSchema = new Schema({
    sellerName:{ 
        type: String, 
        required: false 
    },
    sellerAvatar:{
        type: Object,
        required: false,
    },
    sellerEmail: { 
        type: String, 
        required: false,
        unique: true, 
    },
    sellerMobile: { 
        type: Number, 
        required: true,
        unique: true, 
    },
    sellerCity:{ 
        type: String, 
        required: false
    },
    sellerDoor:{ 
        type: String, 
        required: false 
    },
    sellerStreet:{ 
        type: String, 
        required: false 
    },
    sellerDistrict:{ 
        type: String, 
        required: false 
    },
    sellerState:{ 
        type: String, 
        required: false 
    },
    sellerCountry:{ 
        type: String, 
        required: false 
    },
    sellerZipCode:{ 
        type: Number, 
        required: false 
    },
    sellerPassword:{
        type: String,
        required: true
    },
    sellerCords: { 
        type: Object,
        required: false 
    },
    sellerShop: { 
        type: String, 
        required: true 
    },
});

const Sellers = mongoose.model('Seller', sellersSchema);

module.exports = Sellers;
