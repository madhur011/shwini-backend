const { Rating } = require("../model/index.model");
const { response } = require("../utils/response")



exports.createRating = async (req, res) => {

  const { userId, productCode, ratingCount, ratingText } = req.body

  try {

    console.log("req.body", req.body);

    if (!userId || !productCode || !ratingCount || !ratingText) {
      return response(res, 201, { message: "Oops! Invalid details!" });
    }

    const rating = await new Rating({
      userId,
      productCode,
      ratingCount,
      ratingText,
      image: req?. file?.path || ""
    })
    await rating.save()

    return response(res, 200, {
      message: "Rating Successfully !!",
      rating
    });


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }

}



exports.getRating = async (req, res) => {
  try {

    const rating = await Rating.find()
    return response(res, 200, {
      message: "Rating Successfully !!",
      rating
    });


  } catch (error) {
    console.log(error);
    return response(res, 500, error);
  }
}
