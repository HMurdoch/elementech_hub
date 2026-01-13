export default function TabButton({ children, onClickContent, isClicked }) {
    return (
        <li>
            <button className={isClicked ? 'active' : undefined} onClick={onClickContent}>{children}</button>
        </li>
    );
}