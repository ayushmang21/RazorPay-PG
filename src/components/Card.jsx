import Image from 'next/image';
import React from 'react';

const ProductCard = ({ image, title, amount, description, onBuyNow }) => {
    return (
        <div className="w-[320px] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white transform hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <Image
                    className="object-cover transform hover:scale-110 transition-transform duration-500"
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <div className="p-6">
                <div className="flex flex-col h-full">
                    <h3 className="font-bold text-2xl mb-2 text-gray-800">
                        {title}
                    </h3>
                    <div className="text-3xl font-bold text-green-600 mb-3">
                        ₹{amount.toLocaleString()}
                    </div>
                    <p className="text-gray-600 text-sm mb-6">
                        {description}
                    </p>
                    <button
                        onClick={onBuyNow}
                        className="mt-auto w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;