const { errorEmbed, getGuild, getUser, getNeededXP, successEmbed } = require("../helpers");

module.exports = {
    name: "calclevel",
    aliases: ["calc-level", "cl"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length != 1){
            return await message.channel.send(errorEmbed(guild.locale, "cl_usage"));
        }
        let user = await getUser(message.guild.id, message.author.id);
        let level = args[0];
        if(!(/^\d+$/g.test(level))){
            return await message.channel.send(errorEmbed(guild.locale, "level_invalid"));
        }
        level = Number(level);
        if(!(level >= 1 && level <= 999)){
            return await message.channel.send(errorEmbed(guild.locale, "level_invalid_number"));
        }
        if(level <= user.level){
            return await message.channel.send(errorEmbed(guild.locale, "lower_level_error"));
        }
        let lxp = getNeededXP(level);
        return await message.channel.send(successEmbed(guild.locale, Bot.textdata[guild.locale].reqxp_message.replace(/\{\{xp\}\}/giu, lxp-user.xp).replace(/\{\{level\}\}/giu, level)));
    }
}