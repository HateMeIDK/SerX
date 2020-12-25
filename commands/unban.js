const { errorEmbed, getGuild, embedder } = require("../helpers")

module.exports = {
    name: "unban",
    required_userperms: ["MANAGE_BANS"],
    required_botperms: ["MANAGE_BANS"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length != 1){
            return await message.channel.send(errorEmbed(guild.locale, "unban_usage"));
        }
        try {
            let ban = await message.guild.fetchBan(args[0]);
            try {
                let unban = await message.guild.members.unban(args[0]);
                return await message.channel.send(embedder({
                    embed: {
                        title: Bot.textdata[guild.locale].member_unbanned_title.replace(/\{\{member\}\}/giu, unban.tag),
                        description: Bot.textdata[guild.locale].member_unbanned
                        .replace(/\{\{moderator\}\}/giu, message.author.tag)
                        .replace(/\{\{moderator_id\}\}/giu, message.author.id)
                        .replace(/\{\{ban_reason\}\}/giu, ban.reason || Bot.textdata[guild.locale].default_reason),
                        color: 0x00FF00
                    }
                }));
            }catch(e){
                return await message.channel.send(errorEmbed(guild.locale, "cannot_unban"));
            }
        }catch(e){
            return await message.channel.send(errorEmbed(guild.locale, "ban_not_found"));
        }
    }
}