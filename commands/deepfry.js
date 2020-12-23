const { MessageAttachment } = require("discord.js");
const { findInGuildByName, errorEmbed, getGuild } = require("../helpers");

module.exports = {
    name: "deepfry",
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let target = message.mentions.members.first() || message.guild.members.cache.get(args.join(" ")) || findInGuildByName(message.guild, args.join(" ")) || message.member;
        try {
            let resp = await (require("node-fetch"))(`https://nekobot.xyz/api/imagegen?type=deepfry&image=${target.user.displayAvatarURL({format: "jpg", size: 1024})}&raw=1`);
            let data = Buffer.from(await resp.arrayBuffer());
            await message.channel.send(new MessageAttachment(data, "deepfried.png"));
        }catch(e){
            await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}