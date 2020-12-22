const { findInGuildByName, errorEmbed, getGuild, getUser, createRankCard } = require("../helpers")

module.exports = {
    name: "rank",
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let _target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args.join(" ")) || message.member;
        let target = await getUser(message.guild.id, _target.id);
        if(!target){
            return await message.channel.send(errorEmbed(guild.locale, "user_not_in_db"));
        }
        let rankCard;
        try {
            rankCard = await createRankCard(target, _target.user);
        }catch(e){
            return await message.channel.send(errorEmbed(guild.locale, e.message));
        }
        await message.channel.send(rankCard);
    }
}