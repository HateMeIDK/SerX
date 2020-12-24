const { MessageAttachment } = require("discord.js");
const { errorEmbed, getGuild } = require("../helpers")

module.exports = {
    name: "redpanda",
    aliases: ["red-panda"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        try {
            let resp = await (require("node-fetch"))("https://some-random-api.ml/img/red_panda");
            let data = await resp.json();
            let resp1 = await (require("node-fetch"))(data.link);
            await message.channel.send(new MessageAttachment(Buffer.from(await resp1.arrayBuffer()), "red_panda.png"));
        }catch(e){
            return await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}