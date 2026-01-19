import React from 'react'

const HeaderTop = () => {
    return (
        <div className="top-header d-block" style={{ backgroundColor: '#1a472a', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                            <div className="marquee-text">
                                🌿 Pure & Organic: No Preservatives 🚫 | 👵 Handcrafted by Grandma with Traditional Love ❤️ | 🏠 Authentic Country Foods: A Taste of Home 🍛 | ✨ Heal with Good Food & Heritage 🌾
                            </div>
                        </div>
                        <style jsx>{`
                            .marquee-text {
                                display: inline-block;
                                padding-left: 100%;
                                animation: marquee 25s linear infinite;
                            }
                            @keyframes marquee {
                                0% {
                                    transform: translateX(0);
                                }
                                100% {
                                    transform: translateX(-100%);
                                }
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeaderTop
