const { getGuild, errorEmbed, successEmbed } = require("../helpers");

module.exports = {
    name: "prune",
    aliases: ["clear", "purge"],
    required_userperms: ["MANAGE_MESSAGES"],
    required_botperms: ["MANAGE_MESSAGES"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length != 1){
            return await message.channel.send(errorEmbed(guild.locale, "prune_usage"));
        }
        let amount = args[0];
        if(!(/^\d+$/g.test(amount))){
            return await message.channel.send(errorEmbed(guild.locale, "prune_invalid_amount"));
        }
        amount = Number(amount);
        if(amount > 999){
            return await message.channel.send(errorEmbed(guild.locale, "prune_invalid_amount"));
        }
        let data = await message.channel.bulkDelete(amount + 1);
        return await message.channel.send(successEmbed(guild.locale, Bot.textdata[guild.locale].prune_success.replace(/\{\{amount\}\}/giu, data.size - 1)));
    }
}