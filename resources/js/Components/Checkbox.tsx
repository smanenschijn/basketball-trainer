import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'border-3 border-gray-300 text-brand-gold shadow-none focus:ring-brand-gold ' +
                className
            }
        />
    );
}
