const { MessageAttachment } = require("discord.js");
const { findInGuildByName, errorEmbed, getGuild } = require("../helpers");

module.exports = {
    name: "gay",
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let target = message.mentions.members.first() || message.guild.members.cache.get(args.join(" ")) || findInGuildByName(message.guild, args.join(" ")) || message.member;
        try {
            let resp = await (require("node-fetch"))(`https://some-random-api.ml/canvas/gay?avatar=${target.user.displayAvatarURL({format: "jpg", size: 1024})}`);
            let data = Buffer.from(await resp.arrayBuffer());
            await message.channel.send(new MessageAttachment(data, "gay.png"));
        }catch(e){
            await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}