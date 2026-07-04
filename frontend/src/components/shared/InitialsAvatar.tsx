import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface InitialsAvatarProps {
  name: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function InitialsAvatar({ name, size = "default", className }: InitialsAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback>{initialsFor(name)}</AvatarFallback>
    </Avatar>
  );
}
