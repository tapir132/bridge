import Emojis from "../../../util/emojis/chatEmojis";
import { TextChannel } from "discord.js";
import { Event } from "../../../interfaces/Event";

export default {
	name: "login",
	runOnce: true,
	run: async (bot) => {
		((await bot.discord.channels.fetch(process.env.ERROR_CHANNEL_ID)) as TextChannel).send(`${Emojis.success} **\`${bot.mineflayer.username}\` has logged in and is now ready!**`,
		);

		setInterval(() => {
			bot.executeCommand("/g online");
		}, 60_000 * 5);

		setInterval(() => {
			bot.sendGuildMessage(
				"gc",
				"Enter the new Bedwars Tournament via our Discord! 19+ rank upgrades to be won! Weekly prizes!",
			);
		}, 60_000 * 15);
		
		setTimeout(async () => {
			bot.executeCommand("/g online");
			bot.sendToLimbo();
		}, 3_000);
	},
	
} as Event;