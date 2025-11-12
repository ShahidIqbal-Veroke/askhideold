import React from "react";
import { Card } from "@/components/ui/card";

export type HeaderKpiCard = {
    icon?: React.ReactNode;
    title: string;
    value: React.ReactNode;
};

type HeaderKPIProps = {
    title: string;
    subtitle?: React.ReactNode;
    cards: HeaderKpiCard[];
    backgroundImage?: string;
    minHeight?: number;
    className?: string;
};

export const HeaderKPI: React.FC<HeaderKPIProps> = ({
    title,
    subtitle,
    cards,
    backgroundImage = "/icons/headerKPI.svg",
    minHeight = 120,
    className = "",
}) => {
    return (
        <div
            className={`flex justify-between items-center bg-no-repeat bg-right-top bg-cover p-4 rounded-xl ${className}`}
            style={{
                backgroundImage: `url('${backgroundImage}')`,
                minHeight,
            }}
        >
            <div className="text-white">
                <h1 className="text-3xl font-bold">{title}</h1>
                {subtitle && <p className="mt-1">{subtitle}</p>}
            </div>

            <div className="flex space-x-4">
                {cards.map((card, idx) => (
                    <Card
                        key={idx}
                        className="relative w-28 h-24 rounded-xl p-3 pb-1.5 flex flex-col justify-center 
                    bg-white/3 backdrop-blur-sm border border-white/20 shadow-[0_4px_30px_rgba(58,74,219,0.45)]"
                    >
                        {card.icon && (
                            <div className="absolute top-2.5 right-3">{card.icon}</div>
                        )}
                        <div className="flex flex-col justify-center h-full text-left text-white mt-3">
                            <p className="text-xs  opacity-90">{card.title}</p>
                            <p className="text-2xl font-bold leading-tight opacity-95">{card.value}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default HeaderKPI;