const { Collection, Client } = require("discord.js");
const { readdirSync, readFileSync } = require("fs");

module.exports = {
    Core: class Core {
        constructor(options){
            this.options = options;
            if(!this.options.token){
                throw new Error("Токен бота не указан.");
            }
            if(!this.options.mongodb_url){
                throw new Error("Строка для подключения к MongoDB не указана.");
            }
            this.commands = new Collection();
            this.client = new Client();
            this.models = {};
            this.xpgain_cd = {};
            this.mongoose = require("mongoose");
	    this.textdata = {};
            this.setupHandlers();
            this.setupDatabase();
        }
        setupHandlers(){
            readdirSync("./commands/").filter(file => file.endsWith(".js")).forEach(commandfile=>{
                let command = require(`./commands/${commandfile}`);
                this.commands.set(command.name, command);
                console.log(`Подгружена команда "${command.name}".`);
            });
            readdirSync("./events/").filter(file => file.endsWith(".js")).forEach(eventfile => {
                let event = require(`./events/${eventfile}`);
                this.client.on(event.trigger, event.handler);
                console.log(`Боту добавлен обработчик на событие "${event.trigger}" - "./events/${eventfile}".`);
            });
            readdirSync("./models/").filter(file => file.endsWith(".js")).forEach(modelfile=>{
                let model = require(`./models/${modelfile}`)(this.mongoose);
                let instance = new model({});
                this.models[instance.constructor.modelName] = model;
                console.log(`Подгружена модель "${instance.constructor.modelName}".`);
            });
	        readdirSync("./locales/").filter(file => file.endsWith(".json")).forEach(localefile=>{
		        let locale = JSON.parse(readFileSync(`./locales/${localefile}`));
		        this.textdata[localefile.split(".")[0]] = locale;
	        });
        }
        setupDatabase(){
            this.mongoose.connect(this.options.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true });
            this.mongoose.connection.on("connected", ()=>{
                console.log("[+] Бот подключился к базе данных.");
            });
        }
        launch(){
            this.client.login(this.options.token);
        }
    }
}
