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

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Please upload video and thumbnail")
    }

    let videoFileUrl, thumbnailUrl;

    try {
        videoFileUrl = await uploadOnCloudinary(videoLocalPath);
        console.log("Video uploaded to cloudinary", videoFileUrl)
    } catch (error) {
        console.log("Error uploading video to cloudinary", error)
        throw new ApiError(500, "Error uploading video to cloudinary")
    }
    
    try {
        thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);
        console.log("Thumbnail uploaded to cloudinary", thumbnailUrl)
    } catch (error) {
        console.log("Error uploading thumbnail to cloudinary", error)
        throw new ApiError(500, "Error uploading thumbnail to cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFileUrl,
        thumbnail: thumbnailUrl,
        title,
        description,
        duration: 0,
        owner: req.user._id
    })

    if(!video) {
        throw new ApiError(500, "Error creating video")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, video, "Video published successfully")
        )


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    
    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "No Video Found")
    }

    return res
        .status(200)
        .json(new ApiResponse(201, video, "video fetched successfully."))


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body

    if(!title || !description) {
        throw new ApiError(400, "All fields are required")
    }

    let thumbnail

    if(req.file?.path) {
        
        const thumbnailLocalPath = req.file?.path;
    
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if(!thumbnail) {
            throw new ApiError(400, "Failed to upload thumbnail")
        }

    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                ...(thumbnail && { thumbnail })
            }
        }, { new : true }
    )

    if(!video) {
        throw new ApiError(404, "Video not found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, 'video details updated successfully'))

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