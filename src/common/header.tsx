
import React from 'react'

export const Header = ({ text, description }: { text: any, description: any }) => {
    return (
        <div className="w-full lg:w-2/3 xl:w-auto">
            <h1 className="font-inter font-semibold text-2xl leading-tight tracking-tight text-black">
                {text}
            </h1>
            <p className="font-inter text-base leading-[140%] text-black py-2">
                {description}
            </p>
        </div>
    )
}

