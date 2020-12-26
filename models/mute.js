module.exports = (mongoose) => {
    let schema = mongoose.Schema({
        guild_id: String,
        user_id: String,
        moderator_id: String,
        reason: String,
        timestamp_start: Number,
        timestamp_end: Number,
        info_channel: String
    });
    return mongoose.model("Mute", schema);
}