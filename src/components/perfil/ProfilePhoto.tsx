import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfilePhoto() {
    return (
        <Avatar className="h-16 w-16">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    );
}