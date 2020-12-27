module.exports = (mongoose) => {
    let schema = mongoose.Schema({
        guild_id: String,
        message_id: String,
        role_id: String,
        emoji: String,
        emoji_view: String
    });
    return mongoose.model("ReactionRole", schema);
}