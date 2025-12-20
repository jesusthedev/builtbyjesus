import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const entries = (await getCollection("logbook"))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 25);

  return rss({
    title: "Built by Jesus • Updates",
    description: "Logbook releases and milestones from builtbyjesus.dev",
    site: context.site ?? "https://builtbyjesus.dev",
    items: entries
      .filter((e) => ["release", "milestone"].includes(String(e.data.type)))
      .map((e) => ({
        title: e.data.title,
        pubDate: e.data.date,
        description: (e.data.facts?.slice(0, 3) || []).join(" • "),
        link: `/logbook/${e.slug}`
      }))
  });
}
