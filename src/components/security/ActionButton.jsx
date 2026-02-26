import { useRef } from 'react';

export default function ActionButton({ children, className = '', onClick, style, type = 'button' }) {
    const ref = useRef();

    function handleClick(e) {
        // ripple effect
        const btn = ref.current;
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        const ripple = btn.getElementsByClassName('ripple')[0];
        if (ripple) ripple.remove();
        btn.appendChild(circle);

        if (onClick) onClick(e);
    }

    return (
        <button ref={ref} type={type} onClick={handleClick} className={`btn-ripple ${className}`} style={style}>
            {children}
        </button>
    );
}
