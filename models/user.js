module.exports = (mongoose) => {
    let schema = mongoose.Schema({
        guild_id: String,
        user_id: String,
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 0 }
    });
    return mongoose.model("User", schema);
}