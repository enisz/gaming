export interface Game {
    id: number;
	name: string;
    cover?: {
        id: number;
        image_id: string;
    }
    artworks?: [{
        id: number;
        image_id: string;
    }]
	first_release_date?: number;
    platforms?: [{
        id: number;
        name: string;
    }]
	screenshots?: [{
        id: number;
        image_id: string;
    }]
	slug: string;
	storyline?: string;
	summary?: string;
    videos?: [{
        id: number;
        name: string;
        video_id: string;
    }],
    bundles: [{
        id: number;
        name: string;
        version_title: string;
    }],
    dlcs: [{
        id: number;
        name: string;
    }];
    total_rating?: number;
    cached: number;
}