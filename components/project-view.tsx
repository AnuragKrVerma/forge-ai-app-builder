"use client";
import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { CodeFragment, Message } from "@/lib/generated/prisma/client";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "./ui/tabs";
import { IconCode, IconWorld } from "@tabler/icons-react";
import { MessagesContainer } from "./messages-container";

interface Props {
  projectId: string;
  initialMessages: (Message & { codeFragment: CodeFragment | null })[] | null;
}

export const ProjectView = ({ projectId, initialMessages }: Props) => {
  const [activeCodeFragment, setActiveCodeFragment] =
    useState<CodeFragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  return (
    <ResizablePanelGroup
      className="h-dvh w-dvh overflow-hidden"
      orientation="horizontal"
    >
      <ResizablePanel defaultSize={"20%"} minSize={"20%"}>
        <MessagesContainer
          projectId={projectId}
          initialMessages={initialMessages}
          activeCodeFragment={activeCodeFragment}
          setActiveCodeFragment={setActiveCodeFragment}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={"80%"} minSize={"50%"}>
        <Tabs
          className={"h-full"}
          defaultValue={"preview"}
          value={tabState}
          onValueChange={(value) => setTabState(value)}
        >
          <div className="w-full flex items-center p-2 border-b gap-x-2">
            <TabsList className={"h-8 p-0 border min-w-48"}>
              <TabsTrigger value={"preview"}>
                <IconWorld />
              </TabsTrigger>
              <TabsTrigger value={"code"}>
                <IconCode />
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={"preview"}>Project preview</TabsContent>
          <TabsContent value={"code"}>Project code</TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
