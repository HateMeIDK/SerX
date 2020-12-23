const { findInGuildByName, errorEmbed, getGuild } = require("../helpers");
const { MessageAttachment } = require("discord.js");

module.exports = {
    name: "colorify",
    aliases: ["colourify"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args[0]) || message.member;
        let value;
        if(args.length == 0){
            return await message.channel.send(errorEmbed(guild.locale, "colorify_usage"));
        }
        if(args.length == 1){
            if(!(/^#([0-9a-f]{3}){1,2}$/gi.test(args[0]))){
                return await message.channel.send(errorEmbed(guild.locale, "invalid_value_hex"));
            }
            value = args[0].slice(1);
        }
        if(args.length > 1){
            if(!(/^#([0-9a-f]{3}){2}$/gi.test(args[1]))){
                return await message.channel.send(errorEmbed(guild.locale, "invalid_value_hex"));
            }
            value = args[1].slice(1);
        }
        let resp = await (require("node-fetch"))(`https://api.alexflipnote.dev/colourify?image=${target.user.displayAvatarURL({format: "jpg", size: 1024})}&c=${value}`, {headers: {
            Authorization: process.env.AF_API_KEY
        }});
        let data = Buffer.from(await resp.arrayBuffer());
        await message.channel.send(new MessageAttachment(data, "colorified.png"));
    }
}