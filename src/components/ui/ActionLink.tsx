import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ActionLinkVariant = "primary" | "ghost" | "white" | "text";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ActionLinkVariant;
  className?: string;
  external?: boolean;
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "aria-label" | "target" | "rel">;

const variantClasses: Record<ActionLinkVariant, string> = {
  primary: "button button-primary",
  ghost: "button button-ghost",
  white: "button button-white",
  text: "text-link",
};

export default function ActionLink({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
  target,
  rel,
  ...accessibilityProps
}: ActionLinkProps) {
  const classes = `${variantClasses[variant]}${className ? ` ${className}` : ""}`;

  if (external) {
    return (
      <a
        {...accessibilityProps}
        className={classes}
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
      >
        {children}
      </a>
    );
  }

  return (
    <Link {...accessibilityProps} className={classes} href={href}>
      {children}
    </Link>
  );
}
