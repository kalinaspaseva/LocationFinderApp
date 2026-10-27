"use client"

import { useState } from "react"

const questions = [
    "Where can I find a luxury restaurant?",
    "Suggest a cozy coffee place.",
    "What nature spots are nearby?",
    "Any lively places for dinner?",
    "Best cultural attractions?",
    "Cheap lunch spots nearby?",
    "Romantic places for a date?",
    "Quiet place to work?",
    "Outdoor activities around me?",
    "Family friendly restaurants?"
]

export function AIPanel({ onSearch }: { onSearch: (query: string) => void }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

    const handleClick = (question: string, index: number) => {
        setActiveIndex(index)
        setLoadingIndex(index)

        onSearch(question)

        setTimeout(() => {
            setLoadingIndex(null)
        }, 500)
    }

    return (
        <aside className="hidden xl:block w-80 border-l border-border bg-card overflow-y-auto shadow-inner">
            <div className="p-4 space-y-3">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                    Ask AI
                </h3>

                {questions.map((q, index) => (
                    <div key={index} className="space-y-1">
                        <button
                            onClick={() => handleClick(q, index)}
                            className="w-full text-left rounded-md px-3 py-2 text-sm border border-input bg-background hover:bg-accent transition"
                        >
                            {q}
                        </button>

                        {activeIndex === index && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                                {loadingIndex === index ? "Searching..." : "Results updated on the map."}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    )
}