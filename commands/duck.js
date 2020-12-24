const { MessageAttachment } = require("discord.js");
const { errorEmbed, getGuild } = require("../helpers")

module.exports = {
    name: "duck",
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        try {
            let resp = await (require("node-fetch"))("https://random-d.uk/api/v2/random");
            let data = await resp.json();
            let resp1 = await (require("node-fetch"))(data.url);
            await message.channel.send(new MessageAttachment(Buffer.from(await resp1.arrayBuffer()), "duck.png"));
        }catch(e){
            return await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}