var Discord = require ("discord.js")
var bot = new Discord.Client()
var prefix = ("!")
var fs = require("fs")
var ytdl = require('ytdl-core')
var servers = {}
const token = process.env.token

function play(connection, message){
  var server = servers[message.guild.id]
  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}))
  server.queue.shift()
  server.dispatcher.on("end", function(){
    if (server.queue[0]) play(connection, message)
    else connection.disconnect()
  })
}

bot.login(token)

bot.on("ready", function()
  {
    console.log("Connected" + "\n" + "Prefix:" + prefix + "\n" + "Serveur(s):" + bot.guilds.size + "\n" + "Total user(s):" + bot.users.size);
  }
)

bot.on("ready", function(){
  bot.user.setPresence({ game: { name: "!info", type: 0}})
})
bot.on("guildMemberAdd", function(member){
  member.guild.channels.find("name", "📜accueil").sendMessage(member.toString() + " **Bienvenue** dans le serveur fais ``!info`` pour avoir la liste des Commandes\n_ps:tu peut inviter des personnes avec ce lien:_ https://discord.gg/YHZ7H8N")
  member.addRole(member.guild.roles.find("name", "MEMBRE"))
})

bot.on("message", function(message){
  var ADMIN = message.guild.roles.find("name", "ADMIN")
  var discriminateur = message.author.discriminator
  var membername = message.author.username
  if (message.author.bot) return
  if (!message.content.startsWith(prefix)) return
  var args = message.content.substring(prefix.length).split(" ")

  switch(args[0].toLowerCase()){
    case "ping":
      message.channel.sendMessage(":ping_pong: Pong")
      break
    case "info":
      if (!message.member.roles.has(ADMIN.id)){
      var embed = new Discord.RichEmbed()
        .addField(":gear: **BOT INFO** :gear:", "API commande:``bientôt``")
        .addField("Prefix:", "!", true)
        .addField("Serveur(s):", + bot.guilds.size, true)
        .addField("user(s):", + bot.users.size, true)
        .setFooter("Dev: ƬΉΣBΣΛЯ")
      message.channel.sendEmbed(embed)
      return
    }
      if (message.member.roles.has(ADMIN.id)){
      var embed = new Discord.RichEmbed()
        .addField(":gear: **BOT INFO** :gear:", "API commande:``bientôt``")
        .addField("Prefix:", "!", true)
        .addField("Serveur(s):", + bot.guilds.size, true)
        .addField("user(s):", + bot.users.size, true)
        .addField("Commande avec Votre Role ADMIN:", ":musical_note:  _**MUSIQUE**_ :musical_note:\n**!Play** + ``url``\n**!Skip**\n**!Stop**\n:tickets: **ADMIN** :tickets:\n**!Clear**")
        .setFooter("Dev: ƬΉΣBΣΛЯ")
      message.channel.sendEmbed(embed)
    }
      break
    case "play":
      if (!args[1]){
        message.channel.sendMessage("Veuillez fournir un lien")
        return
      }
      if (!message.member.voiceChannel){
        message.channel.sendMessage("vous devez être dans un Channel vocal")
        return
      }
      if (!message.member.roles.has(ADMIN.id)){
        message.channel.sendMessage("Vous n'avez pas le Role ADMIN")
        return
      }
      if (!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      }
      var server = servers[message.guild.id]
      server.queue.push(args[1])
      message.delete()
      var embed = new Discord.RichEmbed()
        .addField("Musique:", args[1])
        .setFooter(membername + "#" + discriminateur, message.author.avatarURL)
      message.channel.sendEmbed(embed)
      if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
        play(connection, message)
      message.delete()
      })
      break
    case "skip":
      if (!message.member.roles.has(ADMIN.id)){
        message.channel.sendMessage("Vous n'avez pas le Role ADMIN")
        return
      }
      var server = servers[message.guild.id]
      if (server.dispatcher) server.dispatcher.end()
      message.channel.sendMessage("Musique Skip")
      break
    case "stop":
      if (!message.member.roles.has(ADMIN.id)){
        message.channel.sendMessage("Vous n'avez pas le Role ADMIN")
        return
      }
      var server = servers[message.guild.id]
      message.channel.sendMessage("Musique Stop")
      if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect()
      break
    case "clear":
      if (!args[1]){
        message.channel.sendMessage("Merci me mettre un nombre (>100)")
        return
      }
      if (message.member.roles.has(ADMIN.id)){
        message.channel.bulkDelete(args[1])
        message.channel.sendMessage("``" + args[1] + "`` " + "clear :heavy_check_mark:")
      }else{
        message.channel.sendMessage("Tu n'as pas le role Admin")
      }
      break
    default:
      var embed = new Discord.RichEmbed()
        .setDescription(":no_entry_sign:  **Commande Invalide** :no_entry_sign:")
        .setFooter("**!info** pour les commande")
      message.channel.sendEmbed(embed)
  }
})
