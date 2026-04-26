import * as React from "react"
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./magnetic";

export const ButtonWithIcon = React.forwardRef(({ children, icon: Icon = ArrowUpRight, className, as, iconClassName, ...props }, ref) => {
  const Comp = as || "button";
  return (
    <Magnetic strength={0.2}>
      <Button asChild className={cn("relative text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group/icon transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer", className)}>
        <Comp ref={ref} {...props}>
          <span className="relative z-10 transition-all duration-500">
            {children}
          </span>
          <div className={cn("absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover/icon:right-[calc(100%-44px)] group-hover/icon:rotate-45", iconClassName)}>
            <Icon size={16} />
          </div>
        </Comp>
      </Button>
    </Magnetic>
  );
});
ButtonWithIcon.displayName = "ButtonWithIcon";
