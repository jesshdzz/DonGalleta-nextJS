import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePhotoProps {
    user: {
        name: string;
        image: string;
    };
}

export function ProfilePhoto({ user }: ProfilePhotoProps) {
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "CN";

    return (
        <Avatar className="h-full w-full">
            <AvatarImage src={user.image} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}