import reactLogo from '../../assets/react-core-concepts.png';
import './Header.css'; 

const reactDescriptions = ['Fundamental', 'Crucial', 'Core'];

function genRandomInteger(max) {
    return Math.floor(Math.random() * (max + 1));
}

export default function Header() {
    const descriptionPrefix = reactDescriptions[genRandomInteger(2)];

    return (
        <header>
            <img src={reactLogo} alt="Stylized atom" />
            <h1>React Essentials</h1>
            <p>
                {descriptionPrefix} React concepts you will need for almost any app you are
                going to build!
            </p>
        </header>
    );
}