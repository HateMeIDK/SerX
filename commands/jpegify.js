const { MessageAttachment } = require("discord.js");
const { findInGuildByName, getGuild } = require("../helpers");

module.exports = {
    name: "jpegify",
    aliases: ["jpeg"],
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let target = message.mentions.members.first() || message.guild.members.cache.get(args.join(" ")) || findInGuildByName(message.guild, args.join(" ")) || message.member;
        let Canvas = require("canvas");
        let image = await Canvas.loadImage(target.user.displayAvatarURL({ format: "jpg", size: 1024 }));
        let canvas = Canvas.createCanvas(image.width, image.height);
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        let iter = 100;
        let factor = 0.25;
        for(let i = 0; i < iter; i++){
            image = await Canvas.loadImage(canvas.toDataURL("image/jpeg", factor * 0.1));
            ctx.drawImage(image, 0, 0);
        }
        await message.channel.send(new MessageAttachment(canvas.toBuffer(), "jpegified.png"));
    }
}