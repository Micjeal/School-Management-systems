import type { ReactNode } from "react";

type PageContainerWidth = "normal" | "wide" | "full";

type PageContainerProps = {
  children: ReactNode;
  width?: PageContainerWidth;
  className?: string;
};

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
  normal: "max-w-5xl",
  wide: "max-w-[1600px]",
  full: "max-w-none",
};

export function PageContainer({
  children,
  width = "wide",
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full min-w-0",
        "px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
        WIDTH_CLASSES[width],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}