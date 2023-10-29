import { Event } from "../../../interfaces/Event";
import fetchHypixelGuild from "../../../util/requests/fetchHypixelGuild";
import fetchMojangProfile from "../../../util/requests/fetchMojangProfile";
import fetchHypixelPlayerProfile from "../../../util/requests/fetchHypixelPlayerProfile";
import isFetchError from "../../../util/requests/isFetchError";
import { TextChannel } from "discord.js";

export default {
	name: "chat:whisper",
	runOnce: false,
	run: async (bot, playerName: string, message: string) => {
		const errorMessage = `/w ${playerName} There was an error! Message me "help" for a list of commands. (If you are attempting to message staff, please start your message with "Staff")`;
		const target = message.startsWith("weeklygexp") || message.startsWith("weeklygxp") ? playerName : (message.split(" ")[0] as string);
		const lowerMessage = message.toLowerCase();

		if (lowerMessage.startsWith("staff")){
            ((await bot.discord.channels.fetch(process.env.DM_LOG_CHANNEL_ID)) as TextChannel).send(`Message from ${playerName}: ${message}`);
            bot.executeCommand(`/w ${playerName} Your message has been forwarded to staff. We will take a look at it as soon as possible.`);
            return;
        }
        if (lowerMessage.startsWith("help")) {
            setTimeout(() => {
                bot.executeCommand(`/w ${playerName} To view your weekly GEXP, message me "weeklygexp".`);
            }, 500);
            setTimeout(() => {
                bot.executeCommand(`/w ${playerName} To message staff, message the bot anything, but make sure to start your message with "Staff" ex: Staff I need help with guild reqs.`);
            }, 3000);
            return;
        }

        

		const mojangProfile = await fetchMojangProfile(target);
		if (isFetchError(mojangProfile)) {
			bot.executeCommand(errorMessage);
			return;
		}

		const playerGuild = await fetchHypixelGuild(mojangProfile.id);
		if (isFetchError(playerGuild)) {
			bot.executeCommand(errorMessage);
			return;
		}

		const member = playerGuild.members.find((guildMember) => guildMember.uuid === mojangProfile.id);
		bot.executeCommand(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			`/w ${playerName} ${target}'s total weekly gexp: ${Object.values(member!.expHistory).reduce(
				(previous, current) => previous + current,
			)}`,
		);
	},
} as Event;
