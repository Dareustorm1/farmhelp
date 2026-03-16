import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

const MONGO = process.env.MONGO_URL;

const email = process.argv[2];
const password = process.argv[3] || 'AdminPass123!';
const name = process.argv[4] || 'Admin User';

if (!email) {
  console.error('Usage: node createAdmin.js <email> [password] [name]');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, password, name, role: 'admin', admin: true });
      console.log('Admin user created:', email);
    } else {
      user.role = 'admin';
      user.admin = true;
      await user.save();
      console.log('Existing user promoted to admin:', email);
    }

    console.log('User id:', user._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
