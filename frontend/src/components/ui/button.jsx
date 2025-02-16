/* eslint-disable react/prop-types */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { Loader } from "lucide-react";

const buttonVariants = cva(
  [
    "inline-flex items-center h-fit justify-center gap-2 rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size- [&_svg]:shrink-0",
    "text-xs md:text-sm",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl",
        add: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground whitespace-nowrap",
        none: "",
      },
      size: {
        default: "px-4 py-2",
        xs: "text-xs px-2 py-1 gap-1",
        sm: "rounded-md px-3 py-1.5 gap-1",
        lg: "rounded-md px-5 py-3",
        icon: "h-8 w-8",
        "icon-sm": "h-6 w-6",
      },
      color: {
        red: 'bg-red-500 hover:bg-red-600 text-white',
        orange: 'bg-orange-500 hover:bg-orange-600 text-white',
        amber: 'bg-amber-500 hover:bg-amber-600 text-white',
        yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        lime: 'bg-lime-500 hover:bg-lime-600 text-white',
        green: 'bg-green-500 hover:bg-green-600 text-white',
        emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        teal: 'bg-teal-500 hover:bg-teal-600 text-white',
        cyan: 'bg-cyan-500 hover:bg-cyan-600 text-white',
        sky: 'bg-sky-500 hover:bg-sky-600 text-white',
        blue: 'bg-blue-500 hover:bg-blue-600 text-white',
        indigo: 'bg-primary hover:bg-indigo-600 text-white',
        violet: 'bg-violet-500 hover:bg-violet-600 text-white',
        purple: 'bg-purple-500 hover:bg-purple-600 text-white',
        fuchsia: 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white',
        pink: 'bg-pink-500 hover:bg-pink-600 text-white',
        rose: 'bg-rose-500 hover:bg-rose-600 text-white',
        slate: 'bg-slate-500 hover:bg-slate-600 text-white',
        gray: 'bg-gray-500 hover:bg-gray-600 text-white',
        zinc: 'bg-zinc-500 hover:bg-zinc-600 text-white',
        neutral: 'bg-neutral-500 hover:bg-neutral-600 text-white',
        stone: 'bg-stone-500 hover:bg-stone-600 text-white'
      },
      borderColor: {
        none: '',
        red: 'border border-red-500 text-red-500 hover:text-red-600 hover:border-red-600 hover:bg-red-50',
        orange: 'border border-orange-500 text-orange-500 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50',
        amber: 'border border-amber-500 text-amber-500 hover:text-amber-600 hover:border-amber-600 hover:bg-amber-50',
        yellow: 'border border-yellow-500 text-yellow-500 hover:text-yellow-600 hover:border-yellow-600 hover:bg-yellow-50',
        lime: 'border border-lime-500 text-lime-500 hover:text-lime-600 hover:border-lime-600 hover:bg-lime-50',
        green: 'border border-green-500 text-green-500 hover:text-green-600 hover:border-green-600 hover:bg-green-50',
        emerald: 'border border-emerald-500 text-emerald-500 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50',
        teal: 'border border-teal-500 text-teal-500 hover:text-teal-600 hover:border-teal-600 hover:bg-teal-50',
        cyan: 'border border-cyan-500 text-cyan-500 hover:text-cyan-600 hover:border-cyan-600 hover:bg-cyan-50',
        sky: 'border border-sky-500 text-sky-500 hover:text-sky-600 hover:border-sky-600 hover:bg-sky-50',
        blue: 'border border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50',
        indigo: 'border border-primary text-primary hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50',
        violet: 'border border-violet-500 text-violet-500 hover:text-violet-600 hover:border-violet-600 hover:bg-violet-50',
        purple: 'border border-purple-500 text-purple-500 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50',
        fuchsia: 'border border-fuchsia-500 text-fuchsia-500 hover:text-fuchsia-600 hover:border-fuchsia-600 hover:bg-fuchsia-50',
        pink: 'border border-pink-500 text-pink-500 hover:text-pink-600 hover:border-pink-600 hover:bg-pink-50',
        rose: 'border border-rose-500 text-rose-500 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50',
        slate: 'border border-slate-500 text-slate-500 hover:text-slate-600 hover:border-slate-600 hover:bg-slate-50',
        gray: 'border border-gray-500 text-gray-500 hover:text-gray-600 hover:border-gray-600 hover:bg-gray-50',
        zinc: 'border border-zinc-500 text-zinc-500 hover:text-zinc-600 hover:border-zinc-600 hover:bg-zinc-50',
        neutral: 'border border-neutral-500 text-neutral-500 hover:text-neutral-600 hover:border-neutral-600 hover:bg-neutral-50',
        stone: 'border border-stone-500 text-stone-500 hover:text-stone-600 hover:border-stone-600 hover:bg-stone-50'
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
const Button = React.forwardRef(({ className, color, variant, border, size, disabled, asChild = false, isLoading = false, absoluteLoader = false, loadingText, loaderClassname, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, color, border, className }), absoluteLoader && "relative")}
      disabled={disabled || isLoading}
      ref={ref}
      {...props} >
      {isLoading ? (
        <span className={cn("pointer-events-none flex shrink-0 items-center justify-center gap-1.5")}>
          <Loader
            className={cn("size-4 shrink-0 animate-spin", loaderClassname, absoluteLoader && "absolute z-10")}
            aria-hidden="true"
          />
          <span className="sr-only">
            {loadingText ? loadingText : "Loading..."}
          </span>
          {loadingText ? loadingText : children}
        </span>
      ) : (
        children
      )}
    </Comp>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }