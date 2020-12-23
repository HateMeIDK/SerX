const { errorEmbed, getGuild, embedder } = require("../helpers")

module.exports = {
    name: "color",
    aliases: ["colour"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        if(args.length != 1){
            return await message.channel.send(errorEmbed(guild.locale, "color_usage"));
        }
        if(!(/^#([0-9a-f]{3}){1,2}$/gi.test(args[0]))){
            return await message.channel.send(errorEmbed(guild.locale, "invalid_value_hex"));
        }
        let value = args[0].slice(1);
        let resp = await (require("node-fetch"))(`https://api.alexflipnote.dev/color/${value}`, {
            headers: {
                Authorization: process.env.AF_API_KEY
            }
        });
        let data = await resp.json();
        return await message.channel.send(embedder({
            embed: {
                title: Bot.textdata[guild.locale]["color_name_title"].replace(/\{\{color\}\}/giu, data.name),
                image: {
                    url: data.image
                },
                color: parseInt(value, 16)
            }
        }));
    }
}