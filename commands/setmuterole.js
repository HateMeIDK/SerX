const { errorEmbed, getGuild, embedder } = require("../helpers")

module.exports = {
    name: "setmuterole",
    aliases: ["set-mute-role", "smr"],
    required_userperms: ["MANAGE_MESSAGES", "MANAGE_ROLES"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length != 1){
            return await message.channel.send(errorEmbed(guild.locale, "setmuterole_usage"));
        }
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find((role)=>role.name.toLowerCase().startsWith(args[0].toLowerCase()));
        if(!role){
            return await message.channel.send(errorEmbed(guild.locale, "target_not_specified"));
        }
        guild.mute_role = role.id;
        await guild.save();
        return await message.channel.send(embedder({
            embed: {
                title: Bot.textdata[guild.locale].success,
                description: Bot.textdata[guild.locale].mr_set
                .replace(/\{\{role\}\}/giu, role)
                .replace(/\{\{role_id\}\}/giu, role.id)
            }
        }));
    }
}