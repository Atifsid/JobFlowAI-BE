import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import AppBreadcrumbs from "./AppBreadcrumbs";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <AppBreadcrumbs />
    </header>
  );
}
