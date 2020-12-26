const { findInGuildByName, errorEmbed, getGuild, embedder, processMute } = require("../helpers");

module.exports = {
    name: "mute",
    required_userperms: ["MANAGE_MESSAGES", "MANAGE_ROLES"],
    required_botperms: ["MANAGE_MESSAGES", "MANAGE_ROLES"],
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
        if(guild.mute_role == ""){
            let message_ = await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].creating_mute_role,
                    description: "..."
                }
            }));
            try {
                let role = await message.guild.roles.create({
                    data: {
                        name: "SerX-Muted",
                        position: message.guild.me.roles.highest.position
                    },
                    reason: Bot.textdata[guild.locale].mr_create_data
                });
                await Promise.all(message.guild.channels.cache.map(channel=>{
                    return channel.overwritePermissions(channel.permissionOverwrites.array().concat([{
                        id: role.id,
                        deny: ["SEND_MESSAGES"]
                    }]));}
                ));
                guild.mute_role = role.id;
                await guild.save();
                await message_.edit(embedder({
                    embed: {
                        title: Bot.textdata[guild.locale].creating_mute_role,
                        description: Bot.textdata[guild.locale].mr_created,
                        color: 0x00FF00
                    }
                }));
            }catch(e){
                return await message_.edit(embedder({
                    embed: {
                        title: Bot.textdata[guild.locale].creating_mute_role,
                        description: Bot.textdata[guild.locale].mr_not_created,
                        color: 0xFF0000
                    }
                }));
            }
        }
        let role = message.guild.roles.cache.get(guild.mute_role);
        if(!role){
            await message.channel.send(errorEmbed(guild.locale, "mr_exists_nf"));
            let message_ = await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].creating_mute_role,
                    description: "..."
                }
            }));
            try {
                role = await message.guild.roles.create({
                    data: {
                        name: "SerX-Muted",
                        position: message.guild.me.roles.highest.position
                    },
                    reason: Bot.textdata[guild.locale].mr_create_data
                });
                await Promise.all(message.guild.channels.cache.map(channel=>{
                    return channel.overwritePermissions(channel.permissionOverwrites.array().concat([{
                        id: role.id,
                        deny: ["SEND_MESSAGES"]
                    }]));}
                ));
                guild.mute_role = role.id;
                await guild.save();
                await message_.edit(embedder({
                    embed: {
                        title: Bot.textdata[guild.locale].creating_mute_role,
                        description: Bot.textdata[guild.locale].mr_created,
                        color: 0x00FF00
                    }
                }));
            }catch(e){
                return await message_.edit(embedder({
                    embed: {
                        title: Bot.textdata[guild.locale].creating_mute_role,
                        description: Bot.textdata[guild.locale].mr_not_created,
                        color: 0xFF0000
                    }
                }));
            }
        }
        let _mute = await (Bot.models.Mute).findOne({
            guild_id: message.guild.id,
            user_id: target.id
        });
        if(_mute){
            return await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].member_already_muted,
                    description: Bot.textdata[guild.locale].member_muted_description
                    .replace(/\{\{moderator\}\}/giu, message.guild.members.cache.get(_mute.moderator_id) || Bot.textdata[guild.locale].unknown_user)
                    .replace(/\{\{moderator_id\}\}/giu, _mute.moderator_id)
                    .replace(/\{\{reason\}\}/giu, _mute.reason),
                    color: 0xFF0000
                }
            }));
        }
        role = message.guild.roles.cache.get(guild.mute_role);
        try {
            await target.roles.add(role);
            let mute = new (Bot.models.Mute)({
                guild_id: message.guild.id,
                user_id: target.id,
                moderator_id: message.author.id,
                reason,
                timestamp_start: Date.now(),
                timestamp_end: Infinity,
                info_channel: message.channel.id
            });
            await mute.save();
            await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].member_muted.replace(/\{\{member\}\}/giu, target.user.tag),
                    description: Bot.textdata[guild.locale].member_muted_description
                    .replace(/\{\{moderator\}\}/giu, message.author.tag)
                    .replace(/\{\{moderator_id\}\}/giu, message.author.id)
                    .replace(/\{\{reason\}\}/giu, reason),
                    color: 0x00FF00
                }
            }));
            return;
        }catch(e){
            return await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].cannot_mute.replace(/\{\{member\}\}/giu, target.user.tag),
                    color: 0xFF0000
                }
            }));
        }
    }
}