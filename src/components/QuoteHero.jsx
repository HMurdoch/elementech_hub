// src/components/QuoteHero.jsx
import React from "react";

export default function QuoteHero() {
    return (
        <div className="quote-hero">
            <p className="quote-hero__line">
                Sufficiently Advanced Technology is Indistinguishable From{" "}
                <span className="quote-hero__magic" data-content="MAGIC">MAGIC</span>
                {" "}- Merlin Murdoch 2025
            </p>
        </div>
    );
}