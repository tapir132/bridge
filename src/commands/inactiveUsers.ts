import { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { Command } from '../interfaces/Command';
import isFetchError from '../util/requests/isFetchError';
import fetchHypixelGuild from '../util/requests/fetchHypixelGuild';
import {EmbedBuilder} from "discord.js";
import fetchHypixelPlayerProfile from '../util/requests/fetchHypixelPlayerProfile';
import fetchHypixelPlayerProfileUUID from '../util/requests/fetchHypixelPlayerProfileUUID';
import * as fs from 'fs';
import * as path from 'path';


export default {
  data: {
    name: 'inactiveusers',
    description: 'Automatically find inactive users yipee!',
  },
  run: async (bot, interaction: CommandInteraction) => {
    const dnkl = path.join(__dirname, '../../dnkl.txt');
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
              const playerProfile = await fetchHypixelPlayerProfileUUID(`${uuid}`);
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
                        if (guildRank == lowestRankName) {
                          const lastLogoutInDays = ((currentTime - playerProfile.lastLogout!) / (1000 * 60 * 60 * 24)).toFixed(1);
                          actionSummary.push(`${names} should be kicked! Last logout was ${lastLogoutInDays} days ago.`);
                        } 
                      }
                    }
                  });
                }
              }
          }else{
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
                      if (guildRank == lowestRankName) {
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
      }

      const embed = new EmbedBuilder()
        .setTitle('Summary')
        .setDescription(actionSummary.length > 0 ? actionSummary.join('\n') : 'No actions were performed. If you think this is an error, you may be getting rate limited.')
    

      await interaction.editReply({ 
        embeds: [embed.toJSON()],  
      });

    } catch (error) {
      console.error('An error occurred:', error);
      await interaction.followUp('An error occurred while processing the command.');
      bot.executeCommand("/oc An error occured when trying to check inactive users.")
    }
  },
  staffOnly: true,
} as Command;
