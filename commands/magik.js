const { findInGuildByName, errorEmbed, getGuild } = require("../helpers");
const { MessageAttachment } = require("discord.js");

module.exports = {
    name: "magik",
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args[0]) || message.member;
        let value = 1;
        if(args.length == 1 && (/^\d+$/.test(args[0]))){
            value = Number(args[0]);
        }
        if(args.length > 1){
            if(!(/^\d+$/g.test(args[1]))){
                return await message.channel.send(errorEmbed(guild.locale, "invalid_value_num"));
            }
            value = Number(args[1]);
        }
        try {
            let resp = await (require("node-fetch"))(`https://nekobot.xyz/api/imagegen?type=magik&image=${target.user.displayAvatarURL({format: "jpg", size: 1024})}&raw=1&intensity=${value}`);
            let data = Buffer.from(await resp.arrayBuffer());
            await message.channel.send(new MessageAttachment(data, "magik.png"));
        }catch(e){
            await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}