const { MessageAttachment } = require("discord.js");
const { errorEmbed, getGuild } = require("../helpers")

module.exports = {
    name: "sadcat",
    aliases: ["sad-cat"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        try {
            let resp = await (require("node-fetch"))("https://api.alexflipnote.dev/sadcat", {
                headers: {
                    Authorization: process.env.AF_API_KEY
                }
            });
            let data = await resp.json();
            let resp1 = await (require("node-fetch"))(data.file, {
                headers: {
                    Authorization: process.env.AF_API_KEY
                }
            });
            await message.channel.send(new MessageAttachment(Buffer.from(await resp1.arrayBuffer()), "sadcat.png"));
        }catch(e){
            return await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}