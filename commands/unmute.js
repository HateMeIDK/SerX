const { findInGuildByName, errorEmbed, getGuild, successEmbed, embedder } = require("../helpers")

module.exports = {
    name: "unmute",
    aliases: ["um"],
    required_userperms: ["MANAGE_MESSAGES", "MANAGE_ROLES"],
    required_botperms: ["MANAGE_MESSAGES", "MANAGE_ROLES"],
    execute: async (message, args) => {
        let guild = await getGuild(message.guild.id);
        if (args.length != 1) {
            return await message.channel.send(errorEmbed(guild.locale, "unmute_usage"));
        }
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || findInGuildByName(message.guild, args[0]);
        let mute = await (Bot.models.Mute).findOne({
            guild_id: message.guild.id,
            user_id: target.id
        });
        if (!mute) {
            return await message.channel.send(errorEmbed(guild.locale, "target_not_muted"));
        }
        if (guild.mute_role == "") {
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
                await Promise.all(message.guild.channels.cache.map(channel => {
                    return channel.overwritePermissions(channel.permissionOverwrites.array().concat([{
                        id: role.id,
                        deny: ["SEND_MESSAGES"]
                    }]));
                }
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
            } catch (e) {
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
        if (!role) {
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
                await Promise.all(message.guild.channels.cache.map(channel => {
                    return channel.overwritePermissions(channel.permissionOverwrites.array().concat([{
                        id: role.id,
                        deny: ["SEND_MESSAGES"]
                    }]));
                }
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
            } catch (e) {
                return await message_.edit(embedder({
                    embed: {
                        title: Bot.textdata[guild.locale].creating_mute_role,
                        description: Bot.textdata[guild.locale].mr_not_created,
                        color: 0xFF0000
                    }
                }));
            }
        }
        await (Bot.models.Mute).deleteMany({ _id: mute._id.toString() });
        role = message.guild.roles.cache.get(guild.mute_role);
        try {
            let member = message.guild.members.cache.get(mute.user_id);
            await member.roles.remove(role);
            return await message.channel.send(embedder({
                embed: {
                    title: Bot.textdata[guild.locale].member_unmuted.replace(/\{\{member\}\}/giu, message.guild.members.cache.get(target.id)?.user?.tag || Bot.textdata[guild.locale].unknown_user),
                    description: Bot.textdata[guild.locale].member_unmuted_description
                    .replace(/\{\{moderator\}\}/giu, message.guild.members.cache.get(mute.moderator_id) || Bot.textdata[guild.locale].unknown_user)
                    .replace(/\{\{moderator_id\}\}/giu, mute.moderator_id)
                    .replace(/\{\{reason\}\}/giu, mute.reason),
                    color: 0x00FF00
                }
            }));
        } catch (e) {
            console.log(e);
            return await message.channel.send(errorEmbed(guild.locale, "can_not_unmute"));
        };
    }
}