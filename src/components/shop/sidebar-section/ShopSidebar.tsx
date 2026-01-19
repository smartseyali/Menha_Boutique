import fetcher from '@/components/fetcher/Fetcher';
import PriceRangeSlider from '@/components/price-range/PriceRangeSlider';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal';
import useSWR from 'swr';

type ShowType = {
    categories: boolean; 
    weights: boolean;
    tags: boolean;
}

function ShopSidebar({
    onSuccess = () => { },
    onError = () => { },
    handleCategoryChange,
    selectedCategory,
    handleWeightChange,
    selectedWeight,
    handleColorChange,
    selectedColor,
    handleTagsChange,
    selectedTags,
    handlePriceChange,
    min,
    max,
}: any) {
    const router = useRouter();
    const pathname = usePathname();
    const [showButton, setShowButton] = useState(true);
    const [show, setShow] = useState<ShowType>({categories:false, weights: false, tags: false});

    useEffect(() => {
        const hiddenPaths = [
            "/product-left-sidebar",
            "/product-right-sidebar",
            "/product-accordion-left-sidebar",
            "/product-accordion-right-sidebar",
        ]

        setShowButton(hiddenPaths.includes(pathname ?? ""));
    }, [pathname]);

    const { data, error } = useSWR("/api/category", fetcher, { onSuccess, onError });

    const { data: weightData } = useSWR("/api/weight", fetcher, { onSuccess, onError });

    const { data: colorData } = useSWR("/api/color", fetcher, { onSuccess, onError });

    const { data: tagData } = useSWR("/api/tags", fetcher, { onSuccess, onError });

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>

    const limit = 5;

    const handleToggleShow = (key: keyof ShowType) => setShow({ ...show, [key]: !show[key] });

    const getData = () => { 
        return show.categories == false? data.slice(0, limit) : data;
    };

    if (!weightData) return <div></div>;

    const getWeightData = () => {
        return show.weights == false? weightData.slice(0, limit) : weightData;
    };

    if (!colorData) return <div></div>;

    const getColorData = () => {
        return colorData;
    };

    if (!tagData) return <div></div>;

    const getTagData = () => {
        return show.tags == false? tagData.slice(0, limit) : tagData;
    };

    const handleFilterBtn = () => {
        router.push("/shop-left-sidebar-col-3");
    };

    const categories = getData();
    const WeightData = getWeightData();
    const color = getColorData();
    const Tags = getTagData();

    return (
        <>
            <div className="bb-shop-wrap">
                <div className="bb-sidebar-block">
                    <div className="bb-sidebar-title">
                        <h3>Category</h3>
                    </div>
                    <div className="bb-sidebar-contact">
                        <ul>
                            {(categories && categories.length > 0) ? categories.map((data: any, index: any) => (
                                <li key={index}>
                                    <Fade triggerOnce direction='up' duration={1000} delay={200} >
                                        <div className="bb-sidebar-block-item">
                                            <input onChange={() => handleCategoryChange(data.category)} checked={selectedCategory?.includes(data.category)} type="checkbox" />
                                            <Link onClick={(e) => e.preventDefault()} href="/#">{data.category}</Link>
                                            <span className="checked"></span>
                                        </div>
                                    </Fade>
                                </li>
                            )):[]}
                            <li>
                                <a onClick={()=> handleToggleShow('categories')}><small>{show.categories ? 'less' : 'load more'}</small></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="bb-sidebar-block">
                    <div className="bb-sidebar-title">
                        <h3>Weight</h3>
                    </div>
                    <div className="bb-sidebar-contact">
                        <ul>
                            {(WeightData && WeightData.length > 0) ? WeightData.map((data: any, index: any) => (
                                <li key={index}>
                                    <Fade triggerOnce direction='up' duration={1000} delay={200} >
                                        <div className="bb-sidebar-block-item">
                                            <input onChange={() => handleWeightChange(data.weight)} checked={selectedWeight?.includes(data.weight)} value='' type="checkbox" />
                                            <a onClick={(e) => e.preventDefault()} href="#">{data.weight}</a>
                                            <span className="checked"></span>
                                        </div>
                                    </Fade>
                                </li>
                            )):[]}
                            <li>
                                <a onClick={()=> handleToggleShow('weights')}><small>{show.weights ? 'less' : 'load more'}</small></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="bb-sidebar-block">
                    <div className="bb-sidebar-title">
                        <h3>Color</h3>
                    </div>
                    <div className="bb-color-contact">
                        <ul>
                            {(color && color.length > 0) ? color.map((data: any, index: any) => (
                                <li key={index} className={selectedColor?.includes(data.color) ? "color-sidebar-active" : ""}>
                                    <div onClick={() => handleColorChange(data.color)} className="bb-sidebar-block-item">
                                        <span className={`${data.color}`}></span>
                                    </div>
                                </li>
                            )):[]}
                        </ul>
                    </div>
                </div>
                <div className="bb-sidebar-block">
                    <div className="bb-sidebar-title">
                        <h3>Price</h3>
                    </div>
                    <PriceRangeSlider onPriceChange={handlePriceChange} min={min} max={max} />
                </div>
                <div className="bb-sidebar-block">
                    <div className="bb-sidebar-title">
                        <h3>Tags</h3>
                    </div>
                    <div className="bb-tags">
                        <ul>
                            {(Tags && Tags.length > 0) ? Tags.map((data: any, index: any) => (
                                    <li className={`${selectedTags?.includes(data.Tag) ? "tag_active" : ""}`} key={index}>
                                        <a  onClick={() => handleTagsChange(data.Tag)}>{data.Tag}</a>
                                    </li>
                            )):[]}
                            <li className='tag_active' onClick={()=> handleToggleShow('tags')}>
                                <a ><small>{show.tags ? 'less' : 'load more'}</small></a>
                            </li>
                        </ul>
                    </div>
                </div>
                {showButton && (
                    <div style={{ margin: "20px 10px", display: "flex", justifyContent: "end" }} className="input-button">
                        <button onClick={handleFilterBtn} type="button" className="bb-btn-2">Filter</button>
                    </div>
                )}

            </div>
        </>
    )
}

export default ShopSidebar
