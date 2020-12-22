const { getGuild, getUser, getNeededXP } = require("../helpers");

module.exports = {
    trigger: "message",
    handler: async(message)=>{
        if(message.channel.type == "dm" || message.author.bot || !message.content)return;
        let guild = await getGuild(message.guild.id);
        if(!guild){
            guild = new (Bot.models.Guild)({
                guild_id: message.guild.id
            });
            await guild.save();
        }
        let user = await getUser(message.guild.id, message.author.id);
        if(!user){
            user = new (Bot.models.User)({
                guild_id: message.guild.id,
                user_id: message.author.id
            });
        }
        if(!Bot.xpgain_cd[message.author.id]){
            Bot.xpgain_cd[message.author.id] = Date.now();
            user.xp += (15 + Math.floor(Math.random() * (25 - 15)));
        }else{
            let now = Date.now()
            if(now - Bot.xpgain_cd[message.author.id] >= 60000){
                Bot.xpgain_cd[message.author.id] = now;
                user.xp += (15 + Math.floor(Math.random() * (25 - 15)));
            }
        }
        if(user.xp >= getNeededXP(user.level + 1)){
            user.level += 1;
        }
        await user.save();
        if(!message.content.startsWith(guild.prefix))return;
        let args = message.content.slice(guild.prefix.length).split(/ +/g);
        let commandName = args.shift();
        let command = Bot.commands.get(commandName) || Bot.commands.find(command => command.aliases && command.aliases.includes(commandName));
        if(!command)return;
        if(command.ownerOnly && message.author.id != process.env.BOT_DEVELOPER)return;
	    let permissions = message.channel.permissionsFor(message.member);
	    let required = command.bot_perms || [];
	    required.unshift("EMBED_LINKS");
	    for(let i in required){
	        let permission = required[i];
		    if(!permissions.has(permission)){
		        return await message.channel.send(Bot.textdata[guild.locale].no_bot_perms.replace(/{{permission}}/giu, permission));
		    }
	    }
	    required = command.user_perms || [];
	    permissions = message.channel.permissionsFor(message.member);
	    for(let i in required){
	        let permission = required[i];
	        if(!permissions.has(permission)){
		        return await message.channel.send(Bot.textdata[guild.locale].no_user_perms.replace(/{{permission}}/giu, permission));
	        }
	    }
	    command.execute(message, args);
    }
}
