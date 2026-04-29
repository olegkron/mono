import type { ReactNode } from "react";
import type { RichTextSegment } from "../content/types";

export function renderRichText(segments: RichTextSegment[]): ReactNode {
  return segments.map((segment, index) =>
    segment.href ? (
      <a href={segment.href} key={`${segment.href}-${index}`} rel="noreferrer" target="_blank">
        {segment.text}
      </a>
    ) : (
      <span key={`${segment.text}-${index}`}>{segment.text}</span>
    ),
  );
}
