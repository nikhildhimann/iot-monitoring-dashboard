import expressAsyncHandler from "express-async-handler";

const asyncHandler = (handler) => expressAsyncHandler(handler);

export default asyncHandler;
