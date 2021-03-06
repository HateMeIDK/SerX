const { MessageAttachment } = require("discord.js");

module.exports = {
    findInGuildByName(guild, name){
        return guild.members.cache.find(member=>{
            if(name){
                if(member.nickname){
                    return member.nickname.toLowerCase().startsWith(name.toLowerCase()) || member.user.username.toLowerCase().startsWith(name.toLowerCase());
                }
                return member.user.username.toLowerCase().startsWith(name.toLowerCase());
            }
        });
    },
    embedder(object){
        object.embed.footer = {
            text: "SerX Alpha v0.4"
        };
        return object;
    },
    errorEmbed(locale, error){
        return module.exports.embedder({
            embed: {
                title: Bot.textdata[locale].error,
                description: Bot.textdata[locale][error] || error,
                color: 0xFF0000
            }
        });
    },
    successEmbed(locale, message){
        return module.exports.embedder({
            embed: {
                title: Bot.textdata[locale].success,
                description: Bot.textdata[locale][message] || message,
                color: 0x00FF00
            }
        });
    },
    async getGuild(guild_id){
        return await (Bot.models.Guild).findOne({
            guild_id
        });
    },
    async getUser(guild_id, user_id){
        return await (Bot.models.User).findOne({
            guild_id,
            user_id
        });
    },
    async getAllUsers(guild_id){
        return await (Bot.models.User).find({
            guild_id
        });
    },
    getNeededXP(level){
        let needed = 0;
        let currentLevel = 0;
        for(let i = 1; i <= level; i++){
            needed += (5 * (currentLevel ** 2) + 50 * currentLevel + 100);
            currentLevel = i;
        }
        return needed;
    },
    async createRankCard(user, _user){
        let rankimages = require("./images.json").rank;
        let iurl = rankimages[0]; // TODO: Custom User Images.
        let Canvas = require("canvas");
        const WIDTH = 1000, HEIGHT = 300, AVOFFSET = 22, FONTSIZE = 60, FONT = "sans-serif", TOFFSETX = 300, TOFFSETY = AVOFFSET + FONTSIZE, TEXTCOLOR = "#ffffff", LINEWIDTH = 620, LINEHEIGHT = 60, LINEOFFSETX = TOFFSETX+25, LINEOFFSETY = TOFFSETY+FONTSIZE*1.5, LINECOLOR="#deadff", RLSTYLE = "#20b2aa";
        let canvas = Canvas.createCanvas(WIDTH, HEIGHT);
        let ctx = canvas.getContext("2d");
        let bg;
        try {
            bg = await Canvas.loadImage(iurl);
        }catch(e){
            throw new Error("rank_image_not_loading");
        }
        ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);
        ctx.font = FONTSIZE+"px "+FONT;
        ctx.fillStyle = TEXTCOLOR;
        ctx.fillText(`${_user.tag}:`, TOFFSETX+FONTSIZE/2, TOFFSETY);
        ctx.fillText(`Level: ${user.level}. XP: ${user.xp}.`, TOFFSETX+FONTSIZE/2, TOFFSETY+FONTSIZE);
        ctx.fillStyle = LINECOLOR;
        ctx.beginPath();
        ctx.arc(LINEOFFSETX, LINEOFFSETY + LINEHEIGHT/2, LINEHEIGHT / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(LINEOFFSETX+LINEWIDTH, LINEOFFSETY + LINEHEIGHT/2, LINEHEIGHT/2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(LINEOFFSETX, LINEOFFSETY, LINEWIDTH, LINEHEIGHT);
        ctx.beginPath();
        ctx.arc(LINEOFFSETX, LINEOFFSETY + LINEHEIGHT/2, LINEHEIGHT / 2, 0, Math.PI * 2, true);
        ctx.arc(LINEOFFSETX+LINEWIDTH, LINEOFFSETY + LINEHEIGHT/2, LINEHEIGHT/2, 0, Math.PI * 2, true);
        ctx.rect(LINEOFFSETX, LINEOFFSETY, LINEWIDTH, LINEHEIGHT);
        ctx.arc(AVOFFSET + (HEIGHT-AVOFFSET*2)/2, AVOFFSET + (HEIGHT-AVOFFSET*2)/2, (HEIGHT-AVOFFSET*2)/2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        let nextLevel = user.level + 1;
        let nlxp = module.exports.getNeededXP(nextLevel);
        let clxp = module.exports.getNeededXP(user.level);
        let xp = user.xp;
        let diff = nlxp - clxp;
        let rlinewidth = Math.floor((xp/diff)*(LINEWIDTH + LINEHEIGHT));
        ctx.fillStyle = RLSTYLE;
        ctx.fillRect(LINEOFFSETX - (LINEHEIGHT/2), LINEOFFSETY, rlinewidth, LINEHEIGHT);
        let avatar = await Canvas.loadImage(_user.displayAvatarURL({format: "png"}));
        ctx.drawImage(avatar, AVOFFSET, AVOFFSET, HEIGHT-AVOFFSET*2, HEIGHT-AVOFFSET*2);
        return new MessageAttachment(canvas.toBuffer(), "rank-card.png");
    },
    async reactionMenu(message, pages, title, time = 60000){
        let embeds = pages.map(page => module.exports.embedder({embed: {title, description: page}}));
        let _message = await message.channel.send(embeds[0]);
        let i = 0;
        await _message.react("??????");
        await _message.react("??????");
        await _message.react("??????");
        let collector = _message.createReactionCollector((reaction, user)=>{
            return (user.id == message.author.id) && (reaction._emoji.name == "??????" || reaction._emoji.name == "??????" || reaction._emoji.name == "??????");
        }, {time});
        collector.on("collect", async(reaction, user)=>{
            if(reaction._emoji.name == "??????"){
                i -= 1;
                if(i == -1)i = embeds.length - 1;
                try{await reaction.users.remove(user.id);}catch(e){}
                await _message.edit(embeds[i]);
                return;
            }
            if(reaction._emoji.name == "??????"){
                i += 1;
                if(i == embeds.length)i = 0;
                try{await reaction.users.remove(user.id);}catch(e){}
                await _message.edit(embeds[i]);
                return;
            }
            if(reaction._emoji.name == "??????"){
                collector.stop();
                await _message.delete();
                return;
            }
        });
    },
    async processMute(mute, final = false){
        if(mute.timestamp_end == Infinity)return;
        if(final){
            try {
                let guild = Bot.client.guilds.cache.get(mute.guild_id);
                if(!guild)throw new Error("Guild not found.");
                let channel = guild.channels.cache.get(mute.info_channel);
                if(!channel)throw new Error("Channel not found.");
                let member = guild.members.cache.get(mute.user_id);
                if(!member)throw new Error("Member not found.");
                let guild_ = await module.exports.getGuild(mute.guild_id);
                let role = guild.roles.cache.get(guild_.mute_role);
                if(!role)throw new Error("Mute role not found.");
                await member.roles.remove(role);
                await channel.send(module.exports.embedder({
                    embed: {
                        title: Bot.textdata[guild_.locale].member_unmuted.replace(/\{\{member\}\}/giu, member.user.tag),
                        description: Bot.textdata[guild_.locale].member_unmuted_description
                        .replace(/\{\{moderator\}\}/giu, guild.members.cache.get(mute.moderator_id) || Bot.textdata[guild_.locale].unknown_user)
                        .replace(/\{\{moderator_id\}\}/giu, mute.moderator_id)
                        .replace(/\{\{reason\}\}/giu, mute.reason),
                        color: 0x00FF00
                    }
                }));
                await Bot.models.Mute.deleteMany({_id: mute._id.toString()});
            }catch(e){}
        }else if(mute.timestamp_end - Date.now() <= 60000){
            setTimeout(module.exports.processMute, mute.timestamp_end - Date.now(), mute, true);
        }
    },
    async processAllMutes(){
        let mutes = await Bot.models.Mute.find({});
        for(let i in mutes){
            let mute = mutes[i];
            await module.exports.processMute(mute);
        }
    },
    validateAndExtractEmoji(emoji){
        let twemoji = require("twemoji");
        if(twemoji.parse(emoji) != emoji){
            return emoji;
        }
        if(/^<a?:(\w+):(\d+)>$/g.test(emoji)){
            return emoji.split(/<a?:/giu)[1].split(":")[1].split(">")[0];
        }
        return null;
    }
}