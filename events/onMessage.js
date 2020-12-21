module.exports = {
    trigger: "message",
    handler: async(message)=>{
        if(message.channel.type == "dm" || message.author.bot || !message.content)return;
        let guild = await (Bot.models.Guild).findOne({
            guild_id: message.guild.id
        });
        if(!guild){
            guild = new (Bot.models.Guild)({
                guild_id: message.guild.id
            });
            await guild.save();
        }
        if(!message.content.startsWith(guild.prefix))return;
        let args = message.content.slice(guild.prefix.length).split(/ +/g);
        let commandName = args.shift();
        let command = Bot.commands.get(commandName) || Bot.commands.find(command => command.aliases && command.aliases.includes(commandName));
        if(!command)return;
        if(command.ownerOnly && message.author.id != process.env.BOT_DEVELOPER)return;
        command.execute(message, args);
    }
}