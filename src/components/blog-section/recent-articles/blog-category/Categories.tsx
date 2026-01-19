import fetcher from '@/components/fetcher/Fetcher';
import { setSelectedCategory } from '@/store/reducer/filterReducer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

const Categories = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
    selectedCategory
}: any) => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const { data, error } = useSWR("/api/blog-category", fetcher, { onSuccess, onError });
    const [showButton, setShowButton] = useState(true);

    useEffect(() => {
        const hiddenPaths = [
            "/blog-detail-left-sidebar",
            "/blog-detail-right-sidebar",
        ]

        setShowButton(hiddenPaths.includes(pathname ?? ""));
    }, [pathname]);

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>;

    const getData = () => {
        if (hasPaginate) return data.data;
        else return data;
    };

    const categories = getData();

    const handleCategoryChange = (category: any) => {
        const updateCategory = selectedCategory.includes(category) ?
            selectedCategory.filter((cat: any) => cat !== category) : [...selectedCategory, category]
        dispatch(setSelectedCategory(updateCategory))
    }

    const handleFilterBtn = () => {
        router.push("/blog-left-sidebar");
    };

    return (
        <>
            <Fade triggerOnce direction='up' duration={1000} delay={400}>
                <div className="blog-inner-contact">
                    <div className="blog-sidebar-title">
                        <h4>Categories</h4>
                    </div>
                    <div className="blog-categories">
                        <ul>
                            {categories.map((data: any, index: any) => (
                                <li key={index}>
                                    <div className="bb-sidebar-block-item">
                                        <input checked={selectedCategory?.includes(data.category)} onChange={() => handleCategoryChange(data.category)} type="checkbox" />
                                        <Link href='/#'>{data.category}</Link>
                                        <span className="checked"></span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                       
                    </div>
                    {showButton && (
                    <div style={{display: "flex", justifyContent: "end", marginTop: "30px"}} className="input-button">
                        <button onClick={handleFilterBtn} type="button" className="bb-btn-2">Filter</button>
                    </div>
                )}
                </div>
            </Fade>
        </>
    )
}

export default Categories
