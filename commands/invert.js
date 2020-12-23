const { MessageAttachment } = require("discord.js");
const { findInGuildByName } = require("../helpers");

module.exports = {
    name: "invert",
    execute: async(message, args)=>{
        let target = message.mentions.members.first() || message.guild.members.cache.get(args.join(" ")) || findInGuildByName(message.guild, args.join(" ")) || message.member;
        try {
            let Canvas = require("canvas");
            let image = await Canvas.loadImage(target.user.displayAvatarURL({ format: "jpg", size: 1024 }));
            let canvas = Canvas.createCanvas(image.width, image.height);
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image,0,0);
            ctx.globalCompositeOperation='difference';
            ctx.fillStyle='white';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            await message.channel.send(new MessageAttachment(canvas.toBuffer(), "inverted.png"));
        }catch(e){
            await message.channel.send(errorEmbed(guild.locale, e.message));
        }
    }
}