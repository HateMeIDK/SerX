const { findInGuildByName, errorEmbed, getGuild, embedder } = require("../helpers");

module.exports = {
    name: "ban",
    required_userperms: ["BAN_MEMBERS"],
    required_botperms: ["BAN_MEMBERS"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args[0]);
        if(!target){
            return await message.channel.send(errorEmbed(guild.locale, "target_not_specified"));
        }
        if(!new RegExp(`<@!?${target.id}>`, "g").test(args[0]) && args[0] != target.id && !target.user.username.startsWith(args[0]) && !target.nickname.startsWith(args[0])){
            return await message.channel.send(errorEmbed(guild.locale, "target_not_specified"));
        }
        if((message.author.id != message.guild.owner.id) && (target.roles.highest.position >= message.member.roles.highest.position || target.id == message.guild.owner.id)){
            return await message.channel.send(errorEmbed(guild.locale, "you_is_lower"));
        }
        let reason = args.slice(1).join(" ") || Bot.textdata[guild.locale].default_reason;
        if(!target.bannable){
            return await message.channel.send(errorEmbed(guild.locale, "not_bannable"));
        }
        const embed1 = embedder({
            embed: {
                title: Bot.textdata[guild.locale].you_are_banned.replace(/\{\{guild\}\}/giu, message.guild.name),
                description: Bot.textdata[guild.locale].ban_message
                .replace(/\{\{moderator\}\}/giu, message.author.tag)
                .replace(/\{\{moderator_id\}\}/giu, message.author.id)
                .replace(/\{\{reason\}\}/giu, reason),
                color: 0xFF0000
            }
        });
        const embed2 = embedder({
            embed: {
                title: Bot.textdata[guild.locale].member_was_banned.replace(/\{\{guild\}\}/giu, message.guild.name).replace(/\{\{member\}\}/giu, target.user.tag),
                description: Bot.textdata[guild.locale].ban_message
                .replace(/\{\{moderator\}\}/giu, message.author.tag)
                .replace(/\{\{moderator_id\}\}/giu, message.author.id)
                .replace(/\{\{reason\}\}/giu, reason),
                color: 0x00FF00
            }
        });
        try {
            await target.user.send(embed1);
        }catch(e){}
        await target.ban({reason});
        await message.channel.send(embed2);
    }
}