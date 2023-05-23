const mongoose = require('mongoose')
const validator = require('validator')
const Task = require('./TodoSchema')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique : true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique : true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens : [{
        token : {
            type :String,
            required : true
        }
    }],
     avatar : {
        type :Buffer,
        contentType : String
     }
},
    {
        timestamps: true,
    }
)

UserSchema.virtual('tasks', {
    ref : 'Post',
    localField : '_id',
    foreignField : 'owner'
})


UserSchema.pre('save', { document: true, query: false } ,async function (next) {
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})


// UserSchema.pre('remove',  { query: true, document: false }, async function (next){
//     const user = this
//     console.log("user", "User in userSchema")
//     await Task.deleteMany({owner : user._id})
//     next()
// })

UserSchema.pre('remove', { document: true, query: false }, function() {
    console.log('Removing doc!');
});

// UserSchema.methods.toJSON = function () {
//     const user = this
//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens
//     delete userObject.avatar
// }

const User = mongoose.model('User', UserSchema)


module.exports = User

