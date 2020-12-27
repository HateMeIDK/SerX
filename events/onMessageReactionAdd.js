module.exports = {
    trigger: "messageReactionAdd",
    handler: async(reaction, user)=>{
        if(reaction.partial)reaction = await reaction.fetch();
        if(reaction.message.channel.type == "dm" || user.bot)return;
        let searchdata;
        if(reaction._emoji.id == null){
            searchdata = {
                guild_id: reaction.message.guild.id,
                message_id: reaction.message.id,
                emoji: reaction._emoji.name
            };
        }else{
            searchdata = {
                guild_id: reaction.message.guild.id,
                message_id: reaction.message.id,
                emoji: reaction._emoji.id
            };
        }
        let rr = await (Bot.models.ReactionRole).findOne(searchdata);
        if(!rr)return;
        let guild = reaction.message.guild;
        let role = guild.roles.cache.get(rr.role_id);
        if(!role)return;
        try {
            let member = reaction.message.guild.members.cache.get(user.id);
            await member.roles.add(role);
        }catch(e){}
    }
}