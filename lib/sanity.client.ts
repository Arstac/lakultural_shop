import { createClient } from "next-sanity";
import createImageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy-project-id";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2023-05-03";

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false for fresh data during dev
});

const builder = createImageUrlBuilder(client);

export const urlFor = (source: any) => {
    return builder.image(source);
};
