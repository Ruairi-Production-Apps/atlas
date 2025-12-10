import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number
}

export function LoadingSpinner({ className, size = 24, ...props }: LoadingSpinnerProps) {
    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <img
                src="/images/atlas/compass-spinner.png"
                alt="Loading..."
                className="animate-spin w-full h-full object-contain"
            />
        </div>
    )
}
