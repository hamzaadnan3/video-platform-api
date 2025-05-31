import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({

    title:{
        type: string,
        required: true,
    },
     description:{
        type: string,
        required: true,
    },
    duration:{
        type: number,
        required: true,
    },    
    isPublished:{
        type: boolean,
        required: true,
        default: true
    },
     videoUrl:{
        type: string,
        required: true,
    },
     thumbNail:{
        type: string,
        required: true,
    },
     owner:
     {
        type: Schema.Types.ObjectId,
        ref:"User"
    }


},{
    timestamps:true
});



videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video",videoSchema)