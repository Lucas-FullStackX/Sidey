"use client";

import LatestUpdates from "@/components/project/LatestUpdates";
import NavProject from "@/components/project/NavProject";
import ProjectDescription from "@/components/project/ProjectDescription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FigmaLogo, GithubLogo } from "@/lib/logos";
import dayjs from "dayjs";
import { LinkIcon, PenIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { isUserOwnerClient, capitalize, getIdFromParams } from "@/lib/utils";
import { profile, project } from "@prisma/client";

const latestUpdateList = [
  {
    id: "1",
    title: "Project Created",
    href: "/",
    createdDate: dayjs().toString(),
  },
  {
    id: "2",
    title: "Launch in Product Hunt",
    href: "/",
    createdDate: dayjs("2023-08-06").toString(),
  },
  {
    id: "3",
    title: "Launch in Product Hunt",
    href: "/",
    createdDate: dayjs("2023-07-06").toString(),
  },
  {
    id: "4",
    title: "Mi mamá me mima mi mamá",
    href: "/",
    createdDate: dayjs("2021-07-06").toString(),
  },
];

export default function Home({ params }: { params: { projectId: string } }) {
  type ProjectState = project & {
    profileToProject: { profile: Pick<profile, "name" | "username"> }[];
  };

  const [projectData, setProjectData] = useState<ProjectState | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const getProject = async () => {
      const supabase = createClientComponentClient();
      type Data = project & {
        profileToProject: {
          profile: Pick<profile, "name" | "username" | "id">;
        }[];
      };
      const { data, error } = await supabase
        .from("project")
        .select("*, profileToProject(profile(name, username, id))")
        .filter("id", "eq", getIdFromParams(params.projectId))
        .filter(
          "profileToProject.projectId",
          "eq",
          getIdFromParams(params.projectId),
        )
        .single();

      const info: Data = data;

      if (error) console.log(error);
      if (info) {
        setProjectData(info);
        console.log(data);
        const ownersId = info.profileToProject.map((p) => p.profile.id);
        const toSet = await isUserOwnerClient(...ownersId);
        setIsOwner(toSet);
      }
    };

    getProject();
  }, []);

  console.log(projectData);
  if (!projectData) return <h1>Error</h1>;

  return (
    <main>
      <header className="mt-6 flex justify-between items-center px-20">
        <div className="group flex gap-6 items-center">
          <div className="flex flex-col relative gap-2">
            <div className="flex gap-3 items-center">
              <h1 className="text-3xl font-semibold">{projectData.name}</h1>
              {projectData.figmaLink && (
                <Button variant="outline" size="icon" asChild>
                  <Link href={projectData.figmaLink} className="text-sm">
                    <FigmaLogo />
                  </Link>
                </Button>
              )}
              {projectData.githubLink && (
                <Button variant="outline" size="icon" asChild>
                  <Link href={projectData.githubLink} className="text-sm">
                    <GithubLogo />
                  </Link>
                </Button>
              )}
              {projectData.projectLink && (
                <Button variant="outline" size="icon" asChild>
                  <Link href={projectData.projectLink}>
                    <LinkIcon size={18} />
                  </Link>
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                >
                  <PenIcon size={12} />
                </Button>
              )}
            </div>
            <div className="flex gap-2 -bottom-7 text-slate-500 text-sm">
              <Badge>{capitalize(projectData.state)}</Badge>
              <p>
                • Created by{" "}
                <Link
                  href={`/user/${projectData.profileToProject[0].profile.username}`}
                  className="underline"
                >
                  {projectData.profileToProject[0].profile.name}
                </Link>{" "}
                • <span>{projectData.likes}</span> likes
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isOwner && (
            <Button className="flex gap-2">
              <PlusIcon size={18} /> Add Update
            </Button>
          )}
        </div>
      </header>
      <NavProject />
      <section className="grid grid-cols-3 px-8 py-4 gap-4">
        <div className="col-start-1 col-end-3">
          <ProjectDescription markdown={projectData.description} />
        </div>
        <div className="col-start-3 col-end-4">
          <LatestUpdates list={latestUpdateList} />
        </div>
      </section>
    </main>
  );
}
