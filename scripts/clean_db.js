const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/user.model');

const clean = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
        await User.deleteMany({});
        console.log("Users deleted");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

clean();
