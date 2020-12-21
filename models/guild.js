module.exports = (mongoose) => {
    let schema = mongoose.Schema({
        guild_id: String,
        prefix: {type: String, default: "sr."},
        blacklisted: {type: Boolean, default: false},
        locale: {type: String, default: "ru"}
    });
    return mongoose.model("Guild", schema);
};