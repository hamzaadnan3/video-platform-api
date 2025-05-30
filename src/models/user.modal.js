import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({

    username:{
        type: string,
        required: true,
        unique: true,
        lowercase: true,
        index:true,
        trim: true,
    },
     email:{
        type: string,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type: string,
        required: true,
        trim: true,
        index: true,

    },
    avatar:{
        type: string,
        required: true,
    },
     coverImage:{
        type: string,
        required: true,
    },
    refreshToken:{
        type: string,
    },
    password:{
        type: string,
        required: true,
    },
     watchHistory:
     [{
        type: Schema.Types.ObjectId,
        ref:"Video"
    }]


},{
    timestamps:true
})

export const User = mongoose.model("User",userSchema)