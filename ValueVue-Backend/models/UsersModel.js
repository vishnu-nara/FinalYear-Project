const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    userName:{ 
        type: String, 
        required: false 
    },
    userAvatar:{
        type: Object,
        required: false,
    },
    userEmail: { 
        type: String, 
        required: false,
        unique: true, 
    },
    userMobile: { 
        type: Number, 
        required: true,
        unique: false, 
    },
    userCity:{ 
        type: String, 
        required: false
    },
    userDoor:{ 
        type: String,
        required: false 
    },
    userStreet:{ 
        type: String, 
        required: false
    },
    userDistrict:{ 
        type: String, 
        required: false
    },
    userState:{ 
        type: String, 
        required: false 
    },
    userCountry:{ 
        type: String, 
        required: false
    },
    userZipCode:{ 
        type: Number, 
        required: false
    },
    userPassword:{
        type: String,
        required: true
    },
    userCords: { 
        type: Object,
        required: false 
    },
});

const Users = mongoose.model('User', usersSchema);

module.exports = Users;
