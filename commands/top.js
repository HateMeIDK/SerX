const { getAllUsers, getGuild, reactionMenu } = require("../helpers")

module.exports = {
    name: "top",
    execute: async(message, args)=>{
        let guild = await getGuild(message.guild.id);
        let allUsers = await getAllUsers(message.guild.id);
        let chunkArray = (array, chunkSize)=>{
            let result = [];
            for(let i = 0; i < array.length; i += chunkSize){
                result.push(array.slice(i, i+chunkSize));
            }
            return result;
        }
        let place = 1;
        let chunked = chunkArray(allUsers.sort((a, b)=>b.xp-a.xp), 15);
        let pages = [];
        for(let i in chunked){
            chunk = chunked[i];
            let pgdata = [];
            for(let j in chunk){
                let _user = chunk[j];
                pgdata.push(`#${place}. ${message.guild.members.cache.get(_user.user_id) ? message.guild.members.cache.get(_user.user_id).user.tag : Bot.textdata[guild.locale].unknown_user}. ${_user.level}lvl, ${_user.xp} xp.`);
                place += 1;
            }
            pages.push(pgdata.join("\n"));
        }
        await reactionMenu(message, pages, Bot.textdata[guild.locale].ranktop_users);
    }
}