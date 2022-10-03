/**
 * Generating the iamge url for IGDB images
 * @param image_id The image id
 * @param size The required image size
 * @returns The url to the image
 */
export const IGDBImage = (image_id: string, size: "cover_small" | "cover_small_2x" | "screenshot_med" | "screenshot_med_2x" | "cover_big" | "cover_big_2x" | "logo_med" | "logo_med_2x" | "screenshot_big" | "screenshot_big_2x" | "screenshot_huge" | "screenshot_huge_2x" | "thumb" | "thumb_2x" | "micro" | "micro_2x" | "720p" | "720p_2x" | "1080p" | "1080p_2x"): string => `https://images.igdb.com/igdb/image/upload/t_${size}/${image_id}.jpg`;

/**
 * Generating a random number between min and max values (inclusive)
 * @param min The minimum number
 * @param max The maximum number
 * @returns The generated number
 */
export const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Get youtube video link
 * @param videoId ID of the video
 * @returns The URL to the default
 */
export const youtubeVideo = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`;

/**
 * Get the thumbnail of a video
 * @param videoId ID of the video
 * @param resolution The resolution of the image
 * @returns The url of the image
 */
export const youtubeThumbnail = (videoId: string, resolution: "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault"): string => `https://img.youtube.com/vi/${videoId}/${resolution}.jpg`;