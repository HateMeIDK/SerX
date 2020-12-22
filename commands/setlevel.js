const { errorEmbed, successEmbed, getGuild, getUser, findInGuildByName } = require("../helpers")

module.exports = {
    name: "setlevel",
    aliases: ["set-level", "sl"],
    required_userperms: ["MANAGE_GUILD"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length != 2){
            return await message.channel.send(errorEmbed(guild.locale, "setlevel_usage"));
        }
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args[0]);
        if(!target){
            return await message.channel.send(errorEmbed(guild.locale, "target_not_specified"));
        }
        let level = args[1];
        if(!(/^\d+$/g.test(level))){
            return await message.channel.send(errorEmbed(guild.locale, "level_invalid"));
        }
        level = Number(level);
        if(!(level >= 1 && level <= 999)){
            return await message.channel.send(errorEmbed(guild.locale, "level_invalid_number"));
        }
        let _target = await getUser(message.guild.id, target.id);
        if(!_target){
            return await message.channel.send(errorEmbed(guild.locale, "user_not_in_db"));
        }
        if((message.author.id != message.guild.owner.id) && (target.roles.highest.position >= message.member.roles.highest.position || target.id == message.guild.owner.id)){
            return await message.channel.send(errorEmbed(guild.locale, "you_is_lower"));
        }
        _target.level = level;
        await _target.save();
        return await message.channel.send(successEmbed(guild.locale, "sl_success"));
    }
}