const modules = import.meta.glob("../content/projects/**/project.json", {
  eager: true
});

export type Project = {
  slug: string;
  title: string;
  type: "work" | "labs" | "archive";
  status: "WIP" | "LIVE" | "PAUSED" | "ARCHIVED";
  tagline?: string;
  tags?: string[];
  updated?: string;
};

export const projects: Project[] = Object.values(modules).map(
  (m: any) => m.default
);
