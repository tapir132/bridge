declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MINECRAFT_EMAIL: string;
			MINECRAFT_PASSWORD: string;

			MINECRAFT_CHAT_SEPARATOR: string;
			USE_FIRST_WORD_OF_AUTHOR_NAME: boolean;
			HYPIXEL_API_KEY: string;
			MINIMUM_NETWORK_LEVEL: string;

			GUILD_NAME: string;
			DISCORD_TOKEN: string;
			DISCORD_PREFIX: string;
			DISCORD_INVITE_LINK: `discord.gg/${string}`;
			USE_RANK_EMOJIS: "true" | "false";
			GUILD_MASTER_UUID: string;

			DISCORD_SERVER_ID: string;
			MEMBER_CHANNEL_ID: string;
			OFFICER_CHANNEL_ID: string;
			BLACKLIST_CHANNEL_ID: string;
			ERROR_CHANNEL_ID: string;

			BOT_OWNER_ID: string;
			STAFF_ROLE_ID: string;

			LOWEST_RANK_NAME: string;

			MIDDLE_RANK_REQUIREMENT: string;
			MIDDLE_RANK_NAME: string;
			HIGHEST_RANK_REQUIREMENT: string;
			HIGHEST_RANK_NAME: string;


			DO_ANNOUNCEMENT: "true" | "false";
			ANNOUNCEMENT: string;

			WELCOME_1: string;
			WELCOME_2: string;
			WELCOME_3: string;
	}
}
}
export {};
