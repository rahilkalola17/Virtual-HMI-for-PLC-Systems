/*
 * File: src/components/NavLink.tsx
 * Purpose: Small compatibility wrapper around react-router's NavLink to
 * expose an easier className API. Header added for documentation only.
 */
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Compatibility props: allow `activeClassName` & `pendingClassName` convenience strings
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

// `NavLink` is a small wrapper that accepts simple className strings and maps
// `isActive`/`isPending` to the provided `activeClassName`/`pendingClassName`.
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
