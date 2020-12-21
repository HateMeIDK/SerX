module.exports = {
    trigger: "ready",
    handler: async()=>{
        console.log(`[+] Бот вышел в онлайн как ${Bot.client.user.tag}.`);
    }
}