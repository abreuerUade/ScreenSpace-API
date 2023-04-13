const Owner = require('../models/ownerModel');
const { omit } = require('lodash');
const bcrypt = require('bcryptjs');

// export async function createUser(input: UserInput) {
//   try {
//     return await UserModel.create(input);
//   } catch (e: any) {
//     throw new Error(e);
//   }
// }

const validatePassword = async (email, password) => {
    const owner = await Owner.findOne({ email })
        .select('+password')
        .select('+role');
    if (!owner) {
        return false;
    }

    const isValid =
        owner.isVerified && (await bcrypt.compare(password, owner.password));

    if (!isValid) {
        return false;
    }
    // return owner;
    return omit(owner.toJSON(), ['password', '__v']);
};

// export async function findUser(query: FilterQuery<UserDocument>) {
//   return UserModel.findOne(query).lean();
// }
module.exports = { validatePassword };
