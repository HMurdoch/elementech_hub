export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                bg: "#0b0b0c",
                redneon: {
                    200: "#ff8a8a",
                    300: "#ff6b6b",
                    400: "#ff4d4d",
                    500: "#ef4444",
                },
            },
            boxShadow: {
                neon: "0 0 25px rgba(239,68,68,0.35)",
                neonLg: "0 0 45px rgba(239,68,68,0.45)",
                innerNeon: "inset 0 0 18px rgba(239,68,68,0.18)",
            },
            backgroundImage: {
                // big soft radial + diagonal noise
                "radial-fade":
                    "radial-gradient(80rem 30rem at 10% -10%, rgba(239,68,68,0.25), transparent 55%), radial-gradient(60rem 30rem at 110% -20%, rgba(239,68,68,0.22), transparent 60%)",
            },
            keyframes: {
                "aurora-pan": {
                    "0%": { transform: "translateX(-10%)" },
                    "50%": { transform: "translateX(10%)" },
                    "100%": { transform: "translateX(-10%)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 24px rgba(239,68,68,0.35)" },
                    "50%": { boxShadow: "0 0 35px rgba(239,68,68,0.5)" },
                },
                shine: {
                    "0%": { transform: "translateX(-120%)" },
                    "100%": { transform: "translateX(220%)" },
                },
            },
            animation: {
                aurora: "aurora-pan 14s ease-in-out infinite",
                glow: "pulse-glow 3.2s ease-in-out infinite",
                shine: "shine 1.2s ease-in-out",
            },
        },
    },
    plugins: [],
}