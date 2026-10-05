"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type ProcessingSubmitButtonProps = {
  children: React.ReactNode;
  processingText: string;
  className?: string;
};

export default function ProcessingSubmitButton({
  children,
  processingText,
  className = "",
}: ProcessingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${
        pending ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {processingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}