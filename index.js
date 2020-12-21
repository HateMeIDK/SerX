require("dotenv").config();

global.Bot = new(require("./core.js").Core)({
    token: process.env.BOT_TOKEN,
    mongodb_url: process.env.MONGODB_URL
});

global.Bot.launch();