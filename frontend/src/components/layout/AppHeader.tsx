import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import AppBreadcrumbs from "./AppBreadcrumbs";
import CommandMenu from "./CommandMenu";

export default function AppHeader() {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen(open => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <AppBreadcrumbs />
      <div className="ml-auto">
        <Button variant="outline" size="sm" onClick={() => setCommandOpen(true)}>
          <SearchIcon />
          <span className="hidden sm:inline">Search jobs</span>
          <kbd className="ml-2 hidden rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </Button>
      </div>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </header>
  );
}
