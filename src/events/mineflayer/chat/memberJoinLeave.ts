import Emojis from "../../../util/emojis/chatEmojis";
import { Event } from "../../../interfaces/Event";
import { HypixelRank } from "../../../interfaces/Ranks";
import { escapeMarkdown } from "discord.js";
import fetchMojangProfile from "../../../util/requests/fetchMojangProfile";
import getRankData from "../../../util/emojis/getRankData";
import isFetchError from "../../../util/requests/isFetchError";
import isUserBlacklisted from "../../../util/isUserBlacklisted";

export default {
	name: "chat:memberJoinLeave",
	runOnce: false,
	run: async (bot, hypixelRank: HypixelRank | undefined, playerName: string, type: "joined" | "left") => {
		const [rank, color] = await getRankData(hypixelRank);
		const guildName = process.env.GUILD_NAME;
		const welcomeList: string[] = [
			process.env.WELCOME_1,
			process.env.WELCOME_2,
			process.env.WELCOME_3,
		  ];
		  function chooseRandomString(strings: string[]): string {
			const randomIndex = Math.floor(Math.random() * strings.length);
			return strings[randomIndex] || "No strings available";
		  }
		if (type === "joined") {
			const mojangProfile = await fetchMojangProfile(playerName);
			const randomWelcome = chooseRandomString(welcomeList);
			await bot.executeCommand(`/gc ${randomWelcome}`);

			if (!isFetchError(mojangProfile) && isUserBlacklisted(mojangProfile.id)) {
				bot.executeCommand(
					`/g kick ${playerName} You have been blacklisted from the guild. Mistake? --> ${process.env.DISCORD_INVITE_LINK}`,
				);
			}
		}
		await bot.sendToDiscord(
			"gc",
			`${type === "joined" ? Emojis.positiveGuildEvent : Emojis.negativeGuildEvent} **${
				rank ? rank + " " : ""
			}${escapeMarkdown(playerName)}** ${type} the guild!`,
			color,
			true,
		);
	},
} as Event;
