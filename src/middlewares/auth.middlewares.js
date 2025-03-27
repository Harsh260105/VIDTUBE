import jwt from 'jsonwebtoken'
import { User } from "../models/user.models.js"
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Middleware to verify JWT token 
// and attach user to request object
// It checks for the token in the request cookies or the Authorization header
// If the token is not present, it throws an Unauthorized error
// If the token is present, it verifies the token using the secret key
// and retrieves the user from the database
// If the user is not found, it throws an Unauthorized error
// If the user is found, it attaches the user to the request object
// and calls the next middleware in the stack

export const verifyJWT = asyncHandler( async (req, _, next) => {
    
    const token = req.cookies.accessToken || req.header('Authorization')?.replace("Bearer ", "")

    if(!token) {
        throw new ApiError(401, "Unauthorized")
    }

    try {
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user) {
            throw new ApiError(401, "Unauthorized")
        }

        req.user = user

        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access tocken")
    }

})