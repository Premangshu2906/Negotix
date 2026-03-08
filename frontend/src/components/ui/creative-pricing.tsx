import { Button } from "@/components/ui/button";
import { Check, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface PricingTier {
    name: string;
    icon: React.ReactNode;
    price: number | string;
    description: string;
    features: string[];
    popular?: boolean;
    color: string;
    buttonText?: string;
    onButtonClick?: () => void;
    disabled?: boolean;
    interval?: string;
}

function CreativePricing({
    tag = "Simple Pricing",
    title = "Make Short Videos That Pop",
    description = "Edit, enhance, and go viral in minutes",
    tiers,
}: {
    tag?: string;
    title?: string;
    description?: string;
    tiers: PricingTier[];
}) {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center space-y-6 mb-16">
                <div className="font-handwritten text-xl text-blue-500 rotate-[-1deg]">
                    {tag}
                </div>
                <div className="relative inline-block mt-4 mb-2">
                    <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
                        {title}
                        <div className="absolute -right-12 top-0 text-amber-500 rotate-12">
                            ✨
                        </div>
                    </h2>
                    <div
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-3 bg-blue-500/40 
                        rotate-[-1deg] rounded-full blur-sm"
                    />
                </div>
                <p className="font-handwritten text-xl text-zinc-400 rotate-[-1deg]">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier, index) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "relative group",
                            "transition-all duration-300",
                            "relative w-full transition-all duration-300",
                            index === 0 && "rotate-[-2deg]",
                            index === 1 && "rotate-[1deg] scale-105 z-10",
                            index === 2 && "rotate-[-1deg]"
                        )}
                    >
                        {/* Background / Shadow element */}
                        <div
                            className={cn(
                                "absolute inset-0 bg-zinc-900",
                                "border-[3px] border-white",
                                "rounded-xl",
                                index === 1 ? "shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]" : "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)]",
                                "transition-all duration-300"
                            )}
                        />

                        <div className="relative p-6">
                            {tier.popular && (
                                <div
                                    className="absolute -top-3 -right-3 bg-amber-400 text-zinc-900 
                                    font-handwritten font-bold px-3 py-1 rounded-full rotate-12 text-sm border-2 border-zinc-900 shadow-[2px_2px_0_0_#fff]"
                                >
                                    Popular!
                                </div>
                            )}

                            <div className="mb-6">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full mb-4",
                                        "flex items-center justify-center",
                                        "border-2 border-white",
                                        tier.color === "amber" && "text-amber-500",
                                        tier.color === "blue" && "text-blue-500",
                                        tier.color === "purple" && "text-purple-500",
                                        !["amber", "blue", "purple"].includes(tier.color) && `text-${tier.color}-500`
                                    )}
                                >
                                    {tier.icon}
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-wide">
                                    {tier.name}
                                </h3>
                                <p className="text-zinc-400 mt-2 font-medium whitespace-pre-line">
                                    {tier.description}
                                </p>
                            </div>

                            {/* Price */}
                            <div className="mb-8 flex items-baseline border-b border-white/20 pb-8">
                                <span className="text-6xl font-black text-white">
                                    ₹{tier.price}
                                </span>
                                <span className="text-zinc-400 font-bold ml-1">
                                    {tier.interval || "/month"}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white bg-transparent shrink-0"
                                        >
                                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-[17px] font-medium text-white">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={cn(
                                    "w-full h-14 text-xl font-bold relative group-hover/btn",
                                    "border-[3px] border-white",
                                    "rounded-xl",
                                    "transition-all duration-300",
                                    "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                                    tier.popular
                                        ? [
                                            "bg-[#ffc107] text-zinc-900 border-zinc-900",
                                            "hover:bg-[#ffcd38]",
                                            "active:bg-[#ffb300]",
                                            "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
                                        ]
                                        : [
                                            "bg-zinc-900 border-white",
                                            "text-white",
                                            "hover:bg-zinc-800",
                                            "active:bg-zinc-950",
                                            "shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)]"
                                        ]
                                )}
                                onClick={tier.onButtonClick}
                                disabled={tier.disabled}
                            >
                                {tier.buttonText || "Get Started"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Decorative background squiggles */}
            <div className="absolute -z-10 inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="absolute top-40 left-10 text-4xl rotate-12 text-zinc-500">
                    ✎
                </div>
                <div className="absolute bottom-40 right-10 text-4xl -rotate-12 text-zinc-500">
                    ✏️
                </div>
            </div>
        </div>
    );
}

export { CreativePricing, type PricingTier };
