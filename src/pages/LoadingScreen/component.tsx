import { useEffect, useState, useRef } from "react";
import "./style.css";
import reservoirDogsLogo from "@/assets/loading-logo.jpeg";

const BAR_LENGTH = 10;
const ONES_COUNT = 3;
const STEP_MS = 100;

function buildBar(offset: number): ("0" | "1")[] {
    return Array.from({ length: BAR_LENGTH }, (_, i) => {
        const wrapped = ((i - offset) % BAR_LENGTH + BAR_LENGTH) % BAR_LENGTH;
        return wrapped < ONES_COUNT ? "1" : "0";
    });
}

interface LoadingScreenProps {
    onComplete?: () => void;
    totalSteps?: number;
}

export default function LoadingScreen({
    onComplete,
    totalSteps = 30,
}: LoadingScreenProps) {
    const [offset, setOffset] = useState(0);
    const [step, setStep] = useState(0);
    const [opacity, setOpacity] = useState(1);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isCompleteRef = useRef(false);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        intervalRef.current = setInterval(() => {
            setOffset((prev) => (prev + 1) % BAR_LENGTH);
            setStep((prevStep) => {
                const nextStep = prevStep + 1;
                
                if (nextStep >= totalSteps && !isCompleteRef.current) {
                    isCompleteRef.current = true;
                    
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    
                    setOpacity(0);
                    
                    setTimeout(() => {
                        onComplete?.();
                    }, 500);
                }
                
                return nextStep;
            });
        }, STEP_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [onComplete, totalSteps]);

    const digits = buildBar(offset);

    return (
        <div 
            className="loading-screen" 
            style={{ 
                opacity, 
                transition: 'opacity 0.5s ease-out',
                pointerEvents: opacity === 0 ? 'none' : 'auto'
            }}
        >
            <img
                src={reservoirDogsLogo}
                alt="Reservoir Dogs"
                className="loading-logo"
                draggable={false}
            />

            <div className="binary-bar-wrapper">
                <div className="binary-bar" aria-label="Loading indicator" role="progressbar">
                    {digits.map((d, i) => (
                        <span
                            key={i}
                            className={`binary-digit ${d === "1" ? "one" : "zero"}`}
                        >
                            {d}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}