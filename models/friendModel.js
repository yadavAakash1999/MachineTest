const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const friendSchema = new mongoose.Schema(
    {
        userId : {type : objectId, ref : "user"},
        friendId : {type : objectId, ref : "user"}
    }
)

module.exports = mongoose.model("friend", friendSchema)