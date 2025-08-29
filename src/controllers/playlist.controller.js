import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if( name.trim() === "" || description.trim() === "" ){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
    })

    if(!playlist) {
        throw new ApiError(
            500,
            "Something went wrong! While making the playlist"
        )
    }

    return res 
        .status(201)
        .json( new ApiResponse(201, playlist, "Playlist created successfully!") )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user 
    
    if( !mongoose.isValidObjectId(userId) ) {
        throw new ApiError(400, "Invalid userID")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: userId
            }
        }
    ])

    if ( !playlists?.length ) {
        throw new ApiError(400, "Playlist not found!")
    }

    console.log(playlists)

    return res
        .status(201)
        .json( new ApiResponse(201, playlists, "Playlists fetched successfully!" ))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if( !mongoose.isValidObjectId(playlistId) ) {
        throw new ApiError(400, "Invalid playlist ID!")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(400, "No playlist found!")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist fetched successfully!"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if( !mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId) ) {
        throw new ApiError(400, "Invalid playlist or video ID!")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        }, {new: true}
    );

    if( !playlist ) {
        throw new ApiError(400, "Playlist not found")
    }

    return res
        .status(201)
        .json(ApiResponse(201, playlist, "Video added successfully!"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if( !mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId) ) {
        throw new ApiError(400, "Invalid playlist or video ID!")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        }, {new: true}
    )

    if(!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if( !mongoose.isValidObjectId(playlistId) ) {
        throw new ApiError(400, "Invalid playlist ID!")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res  
        .status(201)
        .json(201, deletedPlaylist, "Playlist deleted successfully")

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if( name.trim() === "" || description.trim() === "" ) {
        throw new ApiError(400, "name and description are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }, 
        }, {new: true}
    )

    if(!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}