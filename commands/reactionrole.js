const { getGuild, embedder, errorEmbed, validateAndExtractEmoji, successEmbed } = require("../helpers");

module.exports = {
    name: "reactionrole",
    aliases: ["reaction-role", "reactionroles", "reaction-roles", "rr"],
    required_botperms: ["MANAGE_ROLES", "MANAGE_MESSAGES"],
    required_userperms: ["MANAGE_ROLES", "MANAGE_MESSAGES"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(!["add", "remove", "list"].includes(args[0])){
            return await message.channel.send(errorEmbed(guild.locale, "reactionrole_usage"));
        }
        if(args[0] == "list"){
            if(args.length != 2){
                return await message.channel.send(errorEmbed(guild.locale, "reactionrole_usage"));
            }
            let rrs = await (Bot.models.ReactionRole).find({
                guild_id: message.guild.id,
                message_id: args[1]
            });
            return await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].rrlist_title,
                    description: (rrs.length?rrs.map(rr => `${rr.emoji} => <@&${rr.role_id}>(ID: ${rr.role_id})`):Bot.textdata[guild.locale].rrlist_empty)
                }
            }));
        }
        if(args[0] == "add"){
            if(args.length != 4){
                return await message.channel.send(errorEmbed(guild.locale, "reactionrole_usage"));
            }
            let role_id = args[2];
            let role = message.guild.roles.cache.get(role_id);
            if(!role){
                return await message.channel.send(errorEmbed(guild.locale, "target_not_specified"));
            }
            let emoji = args[3];
            let extracted = validateAndExtractEmoji(emoji);
            if(!extracted){
                return await message.channel.send(errorEmbed(guild.locale, "invalid_emoji"));
            }
            let message_id = args[1];
            let check = (
                (await (Bot.models.ReactionRole).findOne({
                    guild_id: message.guild.id,
                    message_id,
                    role_id
                }))
                || (await (Bot.models.ReactionRole).findOne({
                    guild_id: message.guild.id,
                    message_id,
                    emoji: extracted
                }))
                ? true
                : false
            );
            if(check){
                return await message.channel.send(errorEmbed(guild.locale, "emoji_or_role_already_in_use"));
            }
            let rr = new (Bot.models.ReactionRole)({
                guild_id: message.guild.id,
                message_id,
                role_id,
                emoji: extracted,
                emoji_view: emoji
            });
            await rr.save();
            await message.channel.send(successEmbed(guild.locale, "rr_success"));
            try {
                let message_ = await message.channel.messages.fetch(message_id);
                await message_.react(emoji == extracted ? emoji : message.guild.emojis.cache.get(extracted));
            }catch(e){}
            return;
        }
        if(args[0] == "remove"){
            if(args.length != 3){
                return await message.channel.send(errorEmbed(guild.locale, "reactionrole_usage"));
            }
            let message_id = args[1], role_id = args[2];
            let rr = await (Bot.models.ReactionRole).findOne({
                guild_id: message.guild.id,
                message_id,
                role_id
            });
            if(!rr){
                return await message.channel.send(errorEmbed(guild.locale, "rr_not_found"));
            }
            await (Bot.models.ReactionRole).deleteMany({_id: rr._id.toString()});
            return await message.channel.send(successEmbed(guild.locale, "rr_remove_success"));
        }
    }
}