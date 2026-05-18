import User from '../models/User';

export const seedAdmin = async () => {
    try {
        const adminEmail = 'bugsbunny1@gmail.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('✅ Admin credentials verified');
            return;
        }

        const admin = new User({
            email: adminEmail,
            password: 'bugsbunny',
            role: 'admin'
        });

        await admin.save();
        console.log('🚀 Initial Admin user created successfully!');
    } catch (error) {
        console.error('❌ Failed to seed admin user:', error);
    }
};
