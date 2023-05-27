const { v2: cloudinary } = require("cloudinary");

const multipleDelete = async (imageName) => {
  await cloudinary.uploader.destroy(imageName);
};

module.exports = { multipleDelete };
