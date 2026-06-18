import type { ReactNode } from "react";
import ActionLink from "./ActionLink";

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  action?: {
    href: string;
    label: ReactNode;
    external?: boolean;
  };
  layout?: "header" | "heading";
  light?: boolean;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  action,
  layout = "header",
  light = false,
  className = "",
}: SectionHeaderProps) {
  const baseClass = layout === "heading" ? "section-heading" : "section-header";

  return (
    <div className={`${baseClass} reveal${className ? ` ${className}` : ""}`}>
      <div>
        <p className={`eyebrow${light ? " eyebrow-light" : ""}`}>{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      {action ? (
        <ActionLink href={action.href} variant="text" external={action.external}>
          {action.label}
        </ActionLink>
      ) : null}
    </div>
  );
}
