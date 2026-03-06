import React from 'react';
import { LucideProps } from 'lucide-react';

export const PrismIcon = React.forwardRef<SVGSVGElement, LucideProps>(({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    className,
    ...props
}, ref) => {
    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M12 3L3 20h18L12 3z" />
            <path d="M12 3v17" />
            <path d="M3 20c3.5-3.5 7-2 9-2" />
            <path d="M21 20c-3.5-3.5-7-2-9-2" />
        </svg>
    );
});

PrismIcon.displayName = 'PrismIcon';
