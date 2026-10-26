import React from 'react'

interface ButtonProps {
    svg: React.ReactNode
    text: string
    backgroundColor?: string
    color?: string
}

const Button: React.FC<ButtonProps> = ({ svg, text, backgroundColor = '#A855F7', color = 'white' }) => {
    return (
        <button
            className='flex items-center cursor-pointer justify-center gap-2 px-2.5 py-3  rounded-lg shadow-xs'
            style={{ backgroundColor }}
            aria-label={text}
        >
            <div className='flex items-center justify-center w-4 h-4'>
                {svg}
            </div>
            <span className='font-inter text-sm truncate font-medium leading-normal '
                style={{ color }}
            >
                {text}
            </span>
        </button>
    )
}

export default Button
