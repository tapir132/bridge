
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

    const lowestRankRequirement: number = Number(process.env.LOWEST_RANK_REQUIREMENT!);
    const middleRankRequirement: number = Number(process.env.MIDDLE_RANK_REQUIREMENT!);
    const highestRankRequirement: number = Number(process.env.HIGHEST_RANK_REQUIREMENT!);

    const lowestRankName = process.env.LOWEST_RANK_NAME
    const middleRankName = process.env.MIDDLE_RANK_NAME
    const highestRankName = process.env.HIGHEST_RANK_NAME



    // Replace the hardcoded UUID with a variable or configuration
    const ownerUUID = process.env.GUILD_MASTER_UUID ?? ")";
    const playerGuild = await fetchHypixelGuild(`${ownerUUID}`);
    if (isFetchError(playerGuild)) {
      await console.log('Error fetching Hypixel guild data.');
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
          if (guildRank === lowestRankName) {
            if (total >= highestRankRequirement) {
              console.log(`${names} should be promoted to ${highestRankName}!`);
              await bot.executeTask(`/g setrank ${names} ${highestRankName}`);
              actionSummary.push(`${names} promoted to ${highestRankName}`);
            } else if (total >= middleRankRequirement) {
              console.log(`${names} should be promoted to ${middleRankName}!`);
              await bot.executeTask(`/g setrank ${names} ${middleRankName}`);
              actionSummary.push(`${names} promoted to ${middleRankName}`);
            }
          }

          if (guildRank === middleRankName) {
            if (total >= highestRankRequirement) {
              console.log(`${names} should be promoted to ${highestRankName}!`);
              await bot.executeTask(`/g setrank ${names} ${highestRankName}`);
              actionSummary.push(`${names} promoted to ${highestRankName}`);
            }
          }
          if (doDemotions == true) {
            if (guildRank === middleRankName && total < middleRankRequirement) {
              console.log(`${names} should be demoted to ${lowestRankName}!`);
              await bot.executeTask(`/g setrank ${names} ${lowestRankName}`);
              actionSummary.push(`${names} demoted to ${lowestRankName}`);
            } else if (guildRank === highestRankName && total < highestRankRequirement) {
              if (total >= middleRankRequirement) {
                console.log(`${names} should be demoted to ${middleRankName}!`);
                await bot.executeTask(`/g setrank ${names} ${middleRankName}`);
                actionSummary.push(`${names} demoted to ${middleRankName}`);
              } else if (total < middleRankRequirement) {
                console.log(`${names} should be demoted to ${lowestRankName}!`);
                await bot.executeTask(`/g setrank ${names} ${lowestRankName}`);
                actionSummary.push(`${names} demoted to ${lowestRankName}`);
              }
            }
          }

        }
        else {
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