const mongoose = require("mongoose");
const { schema } = require("./userModel");
const objectId = mongoose.Schema.Types.ObjectId;

const friendRequistSchema = new mongoose.Schema({
    sender : {type : objectId, ref : "user"},
    reciever : {type : objectId, ref : "user"}
})

module.exports = mongoose.model("friendRequest", friendRequistSchema);