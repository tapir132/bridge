import { FetchError } from "../../interfaces/FetchError";
import { HypixelPlayerResponse } from "../../interfaces/HypixelPlayerResponse";
import fetch from "node-fetch";

export default async (uuid: string) => {
	const response = await fetch(`https://api.hypixel.net/player?key=${process.env.HYPIXEL_API_KEY}&uuid=${uuid}`);

	return response.status === 200
		? (((await response.json()) as any).player as HypixelPlayerResponse) // eslint-disable-line @typescript-eslint/no-explicit-any
		: (response as FetchError);
};
