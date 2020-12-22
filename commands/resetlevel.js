const { errorEmbed, getGuild, getUser, successEmbed, findInGuildByName } = require("../helpers");

module.exports = {
    name: "resetlevel",
    aliases: ["reset-level", "rl"],
    required_userperms: ["ADMINISTRATOR"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length < 1){
            return await message.channel.send(errorEmbed(guild.locale, "rl_usage"));
        }
        if(args[0] == "all"){
            await (Bot.models.User).deleteMany({guild_id: message.guild.id});
            return await message.channel.send(successEmbed(guild.locale, "resetted_levels_all"));
        }
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args[0]);
        if(!target){
            return await message.channel.send(errorEmbed(guild.locale, "target_not_specified"));
        }
        let _target = await getUser(message.guild.id, target.id);
        if(!_target){
            return await message.channel.send(errorEmbed(guild.locale, "user_not_in_db"));
        }
        await _target.delete();
        return await message.channel.send(successEmbed(guild.locale, "resetted_levels_one"));
    }
}