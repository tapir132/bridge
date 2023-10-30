import { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { Command } from '../interfaces/Command';
import isFetchError from '../util/requests/isFetchError';
import fetchHypixelGuild from '../util/requests/fetchHypixelGuild';
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
  data: {
    name: 'syncranks',
    description: 'Automatically promote and demote users!',
    options: [
      {
          name: "demote",
          description: "Would you like to demote users?",
          type: ApplicationCommandOptionType.Boolean,
          required: true,
      },
  ],  
  },
  run: async (bot, interaction: CommandInteraction, args) => {
    const doDemotions = args[0];
    const memberRequirement: number = Number(process.env.MEMBER_RANK_REQUIREMENT!);
    //memberRequirement currently causes a compile error as it is not being used yet, but it does not affect code functionality
    const eliteRequirement: number = Number(process.env.ELITE_RANK_REQUIREMENT!);
    const fairRequirement: number = Number(process.env.FAIR_RANK_REQUIREMENT!);
    


    // Replace the hardcoded UUID with a variable or configuration
    const ownerUUID = process.env.GUILD_MASTER_UUID ?? ")";
    const playerGuild = await fetchHypixelGuild(`${ownerUUID}`);
    if (isFetchError(playerGuild)) {
      await interaction.reply('Error fetching Hypixel guild data.');
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


          // Find the rank requirement for the current member's rank
          if (guildRank === 'Member' && total >= eliteRequirement) {
            if (guildRank === 'Member' && total >= fairRequirement) {
              console.log(`${names} should be promoted to Fair!`);
              await bot.executeTask(`/g setrank ${names} Fair`);
              actionSummary.push(`${names} promoted to Fair`);
            }else{
            console.log(`${names} should be promoted to Elite!`);
            await bot.executeTask(`/g setrank ${names} Elite`);
            actionSummary.push(`${names} promoted to Elite`);
            }
          }
          if (guildRank === 'Elite' && total >= fairRequirement) {
            console.log(`${names} should be promoted to Fair!`);
            await bot.executeTask(`/g setrank ${names} Fair`);
            actionSummary.push(`${names} promoted to Fair`);
          }
          if (guildRank === 'Elite' && total <= eliteRequirement && doDemotions === true) {
            console.log(`${names} should be demoted to Member!`);
            await bot.executeTask(`/g setrank ${names} Member`);
            console.log (`${doDemotions}`)
            actionSummary.push(`${names} demoted to Member`);
          }
          if (guildRank === 'Fair' && total <= fairRequirement && doDemotions === true) {
            if (guildRank === 'Fair' && total <= eliteRequirement && doDemotions === true) {
              console.log(`${names} should be demoted to Member!`);
              console.log (`${doDemotions}`)
              actionSummary.push(`${names} demoted to Member`);
            }else{
            console.log(`${names} should be demoted to Elite!`);
            console.log (`${doDemotions}`)
            actionSummary.push(`${names} demoted to Elite`);
            }
          }
        } else {
          console.error(`Error fetching names for UUID: ${uuid}`);
        }
      }

      // Your response message after processing all members
      const embed = new EmbedBuilder()
        .setTitle('Summary')
        .setDescription(actionSummary.length > 0 ? actionSummary.join('\n') : 'No actions were performed.');

      // Send the embed
      await interaction.editReply({ embeds: [embed.toJSON()] });

    } catch (error) {
      console.error('An error occurred:', error);
      await interaction.followUp('An error occurred while processing the command.');
    }
  },
  staffOnly: true,
} as Command;
