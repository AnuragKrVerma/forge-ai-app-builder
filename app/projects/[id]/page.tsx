import { ProjectView } from "@/components/project-view";
import { apiClient } from "@/lib/api-client";
import React from "react";

const ProjectPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { data } = await apiClient.messages.get({ query: { projectId: id } });

  console.log("Fetched messages for project:", data);

  return <ProjectView projectId={id} initialMessages={data} />;
};

export default ProjectPage;
