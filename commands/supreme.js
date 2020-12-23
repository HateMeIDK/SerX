const { errorEmbed, getGuild } = require("../helpers");
const { MessageAttachment } = require("discord.js");

module.exports = {
    name: "supreme",
    execute: async(message, args) => {
        let guild = await getGuild(message.guild.id);
        if(args.length == 0 || !(/^([A-Za-z]| )+$/g.test(args.join(" ")))){
            return await message.channel.send(errorEmbed(guild.locale, "supreme_usage"));
        }
        let text = args.join(" ");
        try {
            let resp = await (require("node-fetch"))(`https://api.alexflipnote.dev/supreme?text=${text}`, {
                headers: {
                    Authorization: process.env.AF_API_KEY
                }
            });
            let data = Buffer.from(await resp.arrayBuffer());
            await message.channel.send(new MessageAttachment(data, "deepfried.png"));
        }catch(e){
            await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}