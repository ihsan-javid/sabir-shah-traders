"use client";

import React, { forwardRef, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export const IdentityCardBody = forwardRef(
  (
    {
      fullName,
      place,
      about,
      avatarUrl,
      avatarText,
      icon: Icon,
      scheme = "plain",
      socials = [],
      displayAvatar = true,
      titleCss,
      cardCss,
      descClass,
      bioClass,
      footerClass,
      className,
      ...rest
    },
    ref
  ) => {
    const isAccent = scheme === "accented";

    return (
      <Card
        ref={ref}
        style={cardCss}
        className={cn(
          "flex h-full flex-col rounded-3xl border-0 p-6",
          isAccent
            ? "text-[var(--on-accent-foreground)]"
            : "bg-card text-card-foreground",
          className
        )}
        {...rest}
      >
        <CardHeader className="p-0">
          {(displayAvatar || Icon) && (
            <div className="flex items-center justify-start">
              {Icon ? (
                <div 
                  className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center ring-2 ring-offset-4 ring-offset-card transition-all duration-500",
                    isAccent ? "bg-foreground/10 text-foreground" : "bg-primary/10 text-primary"
                  )}
                  style={
                    {
                      "--tw-ring-color": "var(--accent-color)",
                    }
                  }
                >
                  {Icon && (React.isValidElement(Icon) ? Icon : <Icon className="h-8 w-8" />)}
                </div>
              ) : (
                <Avatar
                  className="h-16 w-16 ring-2 ring-offset-4 ring-offset-card"
                  style={
                    {
                      "--tw-ring-color": "var(--accent-color)",
                    }
                  }
                >
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{avatarText}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
          
          {place && (
            <CardDescription
              className={cn(
                "pt-6 text-left font-medium uppercase tracking-wider text-[10px]",
                !isAccent && "text-muted-foreground",
                descClass
              )}
              style={isAccent ? { color: "var(--on-accent-muted-foreground)" } : {}}
            >
              {place}
            </CardDescription>
          )}
          
          <CardTitle
            className={cn(
              "text-2xl text-left font-display font-bold mt-1",
              !place && "pt-6"
            )}
            style={{
              ...(isAccent ? { color: "var(--on-accent-foreground)" } : {}),
              ...titleCss,
            }}
          >
            {fullName}
          </CardTitle>
        </CardHeader>

        <CardContent className="mt-4 flex-grow p-0">
          <p
            className={cn(
              "text-sm leading-relaxed text-left line-clamp-3",
              !isAccent && "text-foreground/80",
              bioClass
            )}
            style={isAccent ? { opacity: 0.9 } : {}}
          >
            {about}
          </p>
        </CardContent>

        {socials.length > 0 && (
          <CardFooter className={cn("mt-6 p-0", footerClass)}>
            <div
              className={cn(
                "flex items-center gap-4",
                !isAccent && "text-muted-foreground"
              )}
              style={
                isAccent
                  ? { color: "var(--on-accent-muted-foreground)" }
                  : undefined
              }
            >
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "transition-opacity",
                    isAccent ? "hover:opacity-75" : "hover:text-foreground"
                  )}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }
);
IdentityCardBody.displayName = "IdentityCardBody";

// ------------------ Animated Container ------------------

export const RevealCardContainer = forwardRef(
  (
    {
      base,
      overlay,
      accent = "var(--primary)",
      textOnAccent = "#fff",
      mutedOnAccent = "rgba(255,255,255,0.8)",
      className,
      ...rest
    },
    ref
  ) => {
    const holderRef = useRef(null);
    const overlayRef = useRef(null);
    const { resolvedTheme } = useTheme();
    const overlayMode = resolvedTheme === "dark" ? "light" : "dark";

    const assignRef = useCallback(
      (el) => {
        holderRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );

    const startClip = "circle(40px at 64px 64px)";
    const expandClip = "circle(160% at 64px 64px)";

    useGSAP(() => {
      gsap.set(overlayRef.current, { clipPath: startClip });
    }, { scope: holderRef });

    const reveal = () => {
      gsap.to(overlayRef.current, {
        clipPath: expandClip,
        duration: 0.8,
        ease: "expo.inOut",
      });
    };
    const conceal = () => {
      gsap.to(overlayRef.current, {
        clipPath: startClip,
        duration: 1,
        ease: "expo.out(1, 1)",
      });
    };

    return (
      <div
        ref={assignRef}
        onMouseEnter={reveal}
        onMouseLeave={conceal}
        style={
          {
            "--accent-color": accent,
            "--on-accent-foreground": textOnAccent,
            "--on-accent-muted-foreground": mutedOnAccent,
            borderColor: "var(--accent-color)",
          }
        }
        className={cn(
          "relative w-full h-full overflow-hidden rounded-3xl border-2 transition-colors duration-500",
          className
        )}
        {...rest}
      >
        <div className="h-full w-full">{base}</div>
        <div
          ref={overlayRef}
          className={cn("absolute inset-0 h-full w-full", overlayMode)}
        >
          {overlay}
        </div>
      </div>
    );
  }
);
RevealCardContainer.displayName = "RevealCardContainer";
