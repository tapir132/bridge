import { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { Command } from '../interfaces/Command';
import isFetchError from '../util/requests/isFetchError';
import fetchHypixelGuild from '../util/requests/fetchHypixelGuild';
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import fetchHypixelPlayerProfile from '../util/requests/fetchHypixelPlayerProfile';
import * as fs from 'fs';
import * as path from 'path';


export default {
  data: {
    name: 'autokick',
    description: 'Automatically kick inactive users!',
    options: [
      {
        name: "auto",
        description: "Would you like to automatically kick users?",
        type: ApplicationCommandOptionType.Boolean,
        required: true,
      },
    ],
  },
  run: async (bot, interaction: CommandInteraction, args) => {
    const dnkl = path.join(__dirname, '../../dnkl.txt');
    const doAutoKick = args[0];
    const lowestRankName = process.env.LOWEST_RANK_NAME;
    const ownerUUID = process.env.GUILD_MASTER_UUID ?? ")";
    const playerGuild = await fetchHypixelGuild(`${ownerUUID}`);
    if (isFetchError(playerGuild)) {
      return;
    }
    
    await interaction.deferReply({ ephemeral: false });
    const actionSummary = [];
    try {
      for (const member of playerGuild.members) {
        const total = Object.values(member.expHistory).reduce((previous, current) => previous + current);
        const uuid = member.uuid;
        const namesResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
        if (namesResponse.ok) {
          const namesData = await namesResponse.json();
          const names = namesData.name;
          const guildRank = member.rank;

          if (total == 0) {
            const playerProfile = await fetchHypixelPlayerProfile(`${names}`);
            if (playerProfile == null && guildRank == lowestRankName) {
              actionSummary.push(`${names} has recently changed their name thus is unable to be checked on the API.`);
            }
            if (!isFetchError(playerProfile)) {
              if (playerProfile.lastLogout == undefined && guildRank == lowestRankName) {
                actionSummary.push(`${names} has their API off!`);
              } else if (playerProfile.lastLogout! > playerProfile.lastLogin!) {
                fs.readFile(dnkl, 'utf-8', (err, data) => {
                  if (err) throw err;
                  if(data.includes(names)){
                    console.log(`${names} excluded`)
                  } else{
                    const currentTime = new Date().getTime();
                    const thirtyDaysAgo = currentTime - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
                    if (playerProfile.lastLogout! <= thirtyDaysAgo) {
                      if (doAutoKick == true && guildRank == lowestRankName) {
                        //bot.executeCommand(`/g kick ${names}`);
                        const lastLogoutInDays = ((currentTime - playerProfile.lastLogout!) / (1000 * 60 * 60 * 24)).toFixed(1);
                        actionSummary.push(`${names} was kicked! Last logout was ${lastLogoutInDays} days ago.`);
                      } else if (guildRank == lowestRankName) {
                        const lastLogoutInDays = ((currentTime - playerProfile.lastLogout!) / (1000 * 60 * 60 * 24)).toFixed(1);
                        actionSummary.push(`${names} should be kicked! Last logout was ${lastLogoutInDays} days ago.`);
                      }
                    }

                  }
                });
              }
            }
          }
        }
      }
      const embed = new EmbedBuilder()
        .setTitle('Summary')
        .setDescription(actionSummary.length > 0 ? actionSummary.join('\n') : 'No actions were performed. If you think this is an error, you may be getting rate limited.');

      // Send the embed
      await interaction.editReply({ embeds: [embed.toJSON()] });

    } catch (error) {
      console.error('An error occurred:', error);
      await interaction.followUp('An error occurred while processing the command.');
    }
  },
  staffOnly: true,
} as Command;
