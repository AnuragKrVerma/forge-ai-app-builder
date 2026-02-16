"use client";
import React, { useCallback, useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import TreeView from "./tree-view";

type FileCollection = Record<string, string>;

interface Props {
  files: FileCollection;
  fragmentId: string;
  projectId: string;
  sandboxId: string;
}

const FileExplorer = ({ files, fragmentId, projectId, sandboxId }: Props) => {
  const [localFiles, setLocalFiles] = useState<FileCollection>(files);
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const filePaths = Object.keys(files);
    return filePaths.length > 0 ? filePaths[0] : null;
  });

  const onSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files],
  );

  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-dvh w-dvw overflow-hidden"
      >
        <ResizablePanel defaultSize={20} minSize={20}>
          <TreeView files={files} onSelect={onSelect} />
        </ResizablePanel>
        <ResizablePanel defaultSize={80} minSize={20}>
          {selectedFile && files[selectedFile] ? (
            <div className="flex flex-col relative w-full h-full">
              <div className="flex flex-1 overflow-auto h-full w-full">
                <CodeView
                  code={localFiles[selectedFile] || files[selectedFile]}
                  lang={getLanguageFromExtension(selectedFile) as string}
                  onChange={(e) => {
                    setLocalFiles((prev) => ({ ...prev, [selectedFile]: e }));
                  }}
                  filePath={selectedFile}
                  localValue={localFiles[selectedFile]}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <p className="text-muted-foreground">
                Select a file to view its content
              </p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default FileExplorer;
