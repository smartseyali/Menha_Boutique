import React, { useEffect, useRef, useState } from 'react';
import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface PriceRangeSliderProps {
    onPriceChange: (min: number, max: number) => void;
    min: number;
    max: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
    onPriceChange,
    max,
    min,
}: any) => {
    const sliderRef = useRef<any>(null);
    const { range } = useSelector((state: RootState) => state.filter);

    const [minValue, setMinValue] = useState(range.min);
    const [maxValue, setMaxValue] = useState(range.max);

    useEffect(() => {
        const actualMin = min === max ? min - 1 : min;
        const actualMax = min === max ? max + 1 : max;
        if (sliderRef.current && !sliderRef.current.noUiSlider) {
            const slider = sliderRef.current;

            noUiSlider.create(slider, {
                start: [range.min, range.max],
                connect: true,
                range: {
                    min: actualMin,
                    max: actualMax,
                },
                format: {
                    to: (value: number) => Math.round(value).toString(),
                    from: (value: string) => parseInt(value, 10),
                },
            });

            slider.noUiSlider.on("update", (values: (number | string)[]) => {
                setMinValue(Math.round(parseFloat(values[0] as string)));
                setMaxValue(Math.round(parseFloat(values[1] as string)));
            });

            slider.noUiSlider.on("change", (values: (number | string)[]) => {
                const newMinValue = parseInt(values[0] as string, 10);
                const newMaxValue = parseInt(values[1] as string, 10);
                if (newMinValue <= newMaxValue) {
                    onPriceChange(newMinValue, newMaxValue);
                }
            });

            slider.noUiSlider.on("change", (values: (number | string)[]) => {
                const minValue = parseInt(values[0] as string, 10);
                const maxValue = parseInt(values[1] as string, 10);
                if (minValue <= maxValue) {
                    onPriceChange(minValue, maxValue);
                }
            });

            return () => {
                slider.noUiSlider.destroy();
            };
        }
    }, [max, min, range, onPriceChange]);

    useEffect(() => {
        const actualMin = min === max ? min - 1 : min;
        const actualMax = min === max ? max + 1 : max;

        if (sliderRef.current && sliderRef.current.noUiSlider) {
            const slider = sliderRef.current.noUiSlider;

            slider.updateOptions({
                start: [range.min, range.max],
                range: {
                    min: actualMin,
                    max: actualMax,
                },
            });
        }
    }, [min, max, range]);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        handle: number
    ) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && sliderRef.current && sliderRef.current.noUiSlider) {
            const values = sliderRef.current.noUiSlider.get() as string[];
            values[handle] = Math.min(Math.max(value, min), max).toString();
            sliderRef.current.noUiSlider.set(values);
        }
    };

    return (
        <div className="bb-price-range">
            <div className="price-range-slider">
                <p className="range-value">
                    <input
                        type="text"
                        value={`₹${minValue} - ₹${maxValue}`}
                        readOnly
                        id="amount"
                        onChange={(e) => handleInputChange(e, 1)}
                    />
                </p>
                <div ref={sliderRef} id="slider-range" className="range-bar"></div>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
