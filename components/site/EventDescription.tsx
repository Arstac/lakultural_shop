import React, { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';
import ReactMarkdown from 'react-markdown';
import { Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types for the custom renderer props
type AnchorProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

interface EventDescriptionProps {
    description: string;
    className?: string;
}

export function EventDescription({ description, className }: EventDescriptionProps) {
    // 1. Pre-process text to linkify Instagram handles
    const processedDescription = description.replace(
        /(^|\s)@([a-zA-Z0-9_.]+)/g,
        '$1[@$2](https://instagram.com/$2)'
    );

    return (
        <div className={cn("prose max-w-none dark:prose-invert", className)}>
            <ReactMarkdown
                components={{
                    a: ({ href, children, ...props }: AnchorProps) => {
                        const isInstagram = href?.includes('instagram.com');

                        if (isInstagram) {
                            return (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white no-underline font-medium hover:opacity-90 transition-opacity text-sm mx-1 align-middle"
                                    {...props}
                                >
                                    <Instagram className="w-3.5 h-3.5" />
                                    <span>{children}</span>
                                </a>
                            );
                        }

                        // Default link behavior
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium decoration-primary/30 underline-offset-4"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                    h1: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
                    h2: ({ children }) => <h4 className="text-lg font-bold mt-5 mb-2">{children}</h4>,
                    h3: ({ children }) => <h5 className="text-base font-bold mt-4 mb-2">{children}</h5>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {processedDescription}
            </ReactMarkdown>
        </div>
    );
}
