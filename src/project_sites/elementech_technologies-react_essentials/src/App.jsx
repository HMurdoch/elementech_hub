import { useState } from "react";

import { CORE_CONCEPTS } from "./data.js";
import { EXAMPLES } from "./data.js";
import Header from "./components/Header/Header.jsx";
import CoreConcept from "./components/CoreConcept.jsx";
import TabButton from "./components/TabButton.jsx";

function App() {
    const [ selectedTopic, setSelectedTopic ] = useState();

    function handleClickContent(selectedButton) {
        setSelectedTopic(selectedButton);
    }

    return (
        <div>
            <Header/>
            <main>
                <section id="core-concepts">
                    <h2>Core Concepts</h2>
                    <ul>
                        {CORE_CONCEPTS.map((item) => (
                            <CoreConcept key={item.title} {...item} />
                        ))}
                    </ul>
                </section>
                <section id="examples">
                    <h2>Examples</h2>
                    <menu>
                        <TabButton
                            isClicked={selectedTopic === 'components'}
                            onClickContent={() => handleClickContent("components")}>
                            Components
                        </TabButton>
                        <TabButton
                            isClicked={selectedTopic === 'jsx'}
                            onClickContent={() => handleClickContent("jsx")}>
                            JSX
                        </TabButton>
                        <TabButton
                            isClicked={selectedTopic === 'props'}
                            onClickContent={() => handleClickContent("props")}>
                            Props
                        </TabButton>
                        <TabButton
                            isClicked={selectedTopic === 'state'}
                            onClickContent={() => handleClickContent("state")}>
                            State
                        </TabButton>
                    </menu>
                    {!selectedTopic ? (<p>Please select an Example.</p>) : (
                        <div id="tab-content">
                            <h3>{EXAMPLES[selectedTopic].title}</h3>
                            <p>{EXAMPLES[selectedTopic].description}</p>
                            <pre>
                                <code>
                                    {EXAMPLES[selectedTopic].code}
                                </code>
                            </pre>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;