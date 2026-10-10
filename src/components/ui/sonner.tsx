import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans font-bold group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:rounded-base group-[.toaster]:shadow-shadow",
          description: "font-medium group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-main group-[.toast]:text-main-foreground group-[.toast]:border-2 group-[.toast]:border-border group-[.toast]:font-bold",
          cancelButton:
            "group-[.toast]:bg-card group-[.toast]:text-foreground group-[.toast]:border-2 group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
