"use client";
import React, { ChangeEvent, useRef, useState } from "react";
import { FieldGroup } from "./ui/field";
import { set, z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  IconArrowUp,
  IconLoader2,
  IconPaperclip,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface Props {
  projectId?: string;
}

const messageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
});

export const AIChatBot = ({ projectId }: Props) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { startUpload, isUploading } = useUploadThing("designImageUploader");

  const onSubmit = async ({ message }: z.infer<typeof messageSchema>) => {
    const cleanMessage = message.trim() ?? "";
    try {
      // if (!cleanMessage && attachedFile) {
      //   toast.error("Type a message or upload an image");
      //   return;
      // }
      // const files = [attachedFile as File];
      // const res = await startUpload(files);

      // const url = res?.[0]?.ufsUrl;

      if (!projectId) {
        const res = await apiClient.projects.post({ message });
        if (res.data?.id) {
          router.push(`/projects/${res.data.id}`);
          return;
        }
      }

      await apiClient.messages.post({ message: cleanMessage, projectId: projectId as string });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      form.reset();
      setAttachedFile(null);
      setImagePreview("");
      router.refresh();
    }
  };

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File;
    if (!file?.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);

    setImagePreview(reader.result as string);
    setAttachedFile(file);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await form.handleSubmit(onSubmit)(e);
      form.reset();
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setImagePreview("");
  };

  return (
    <div className="mx-auto flex flex-col w-full gap-4">
      <div className="relative z-10 flex flex-col w-full mx-auto content-center">
        <form
          className="overflow-visible rounded-xl border p-2 bg-[#ffeac1] border-[#ffeac1] focus-within:border-[#ffeac1]"
          id="message-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {imagePreview && attachedFile && (
            <div className="relative flex items-center w-fit gap-2 mb-2 overflow-hidden">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <Image
                  alt={attachedFile.name}
                  src={imagePreview}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                className="absolute z-10 rounded-full shadow-2xl right-0 top-0 bg-[#f7f4ee] p-1 cursor-pointer"
                type="button"
                onClick={removeFile}
              >
                <IconX scale={16} />
              </button>
            </div>
          )}

          <FieldGroup>
            <Controller
              name="message"
              control={form.control}
              render={({ field }) => {
                return (
                  <Textarea
                    {...field}
                    className="max-h-50 min-h-16 resize-none rounded-none border-none bg-transparent! p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
                    placeholder="Ask Forge AI"
                    onKeyDown={handleKeyDown}
                  />
                );
              }}
            />
          </FieldGroup>
          <div className="flex item-center gap-1">
            <div className="flex items-end gap-0.5 sm:gap-1">
              <input
                type="file"
                className={"sr-only"}
                onChange={handleSelectFile}
                ref={fileRef}
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={"-ml-0.5 h-7 w-7 rounded-md cursor-pointer"}
                  type="button"
                >
                  <IconPlus size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className={"space-y-1"}>
                  <DropdownMenuItem
                    className={"rounded-[calc(1rem-6px)] text-xs"}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <IconPaperclip
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span>Attach File</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="ml-auto flex item-center gap-0.5 sm:gap-1">
              <Button
                className={"h-7 w-7 rounded-full shadow-lg cursor-pointer"}
                size={"icon"}
                type="submit"
                variant={"default"}
                form="message-form"
                disabled={form.formState.isSubmitting || isUploading}
              >
                {form.formState.isSubmitting || isUploading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconArrowUp size={16} />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
