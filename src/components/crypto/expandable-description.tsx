"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface ExpandableDescriptionProps {
  text: string;
  showMoreLabel: string;
  showLessLabel: string;
  maxLength?: number;
}

export function ExpandableDescription({
  text,
  showMoreLabel,
  showLessLabel,
  maxLength = 900,
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = text.length > maxLength;

  const visibleText = useMemo(() => {
    if (!shouldTruncate || isExpanded) {
      return text;
    }

    return `${text.slice(0, maxLength).trim()}…`;
  }, [isExpanded, maxLength, shouldTruncate, text]);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-7 text-muted-foreground">
        {visibleText}
      </p>

      {shouldTruncate ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? showLessLabel : showMoreLabel}
        </Button>
      ) : null}
    </div>
  );
}
