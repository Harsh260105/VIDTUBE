import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO : get all videos based on query, sort, pagination
    
    const filter = {}

    if(query) {
        filter.$or = [
            { title: { $regex: query, $options: "i"} },
            { description: { $regex: query, $options: "i"} },
        ]
    }

    if(userId) {
        filter.owner = userId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;

    try {
        const aggregationPipeline = Video.aggregate([
            { $match: filter },
            { $sort: sortOptions }
        ])
        
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        }

        const videos = await Video.aggregatePaginate(aggregationPipeline, options);

        if(!videos || videos.docs.length === 0) {
            throw new ApiError(404, "No videos found")
        }

        return res
            .status(200)
            .json( 
                new ApiResponse(200, videos[0], "Videos fetched successfully")
            )

    } catch (error) {
        throw new ApiError(error.statusCode || 500 , error.message || "Error fetching videos")
    }

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}