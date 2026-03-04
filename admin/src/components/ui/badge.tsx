import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-bold",
  {
    variants: {
      variant: {
        default: "brutal-border bg-[#DBEAFE] text-black",
        success: "bg-green-100 text-green-800 rounded-full",
        muted: "bg-gray-100 text-gray-500 rounded-full",
        destructive: "bg-red-100 text-red-800 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
