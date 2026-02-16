
import { createClient } from "next-sanity";
import { performSanityFetch } from "../lib/sanity.client"; // If that exists, or just use createClient directly

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "vo84ei3l";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2023-05-03";

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
});

async function checkData() {
    console.log(`Checking Sanity Project: ${projectId}, Dataset: ${dataset}`);
    try {
        const albums = await client.fetch(`*[_type == "album"]{
            title,
            "slug": slug.current,
            "trackCount": count(tracks),
            tracks[]{
                title,
                "previewUrl": previewAudio.asset->url
            }
        }`);

        console.log("Albums found:", albums.length);
        console.log(JSON.stringify(albums, null, 2));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

checkData();
