interface Products {
    category: string;
    sale: string;
    image: string;
    imageTwo: string;
    oldPrice: number;
    newPrice: number;
    title: string;
    rating: any;
    status: string;
    location: string;
    brand: string;
    sku: number;
    quantity: number;
    id: any;
    itemLeft: any;
}

const offer = [

    {
        title: "Pirandai Thokku",
        sale: "",
        image: "/assets/img/product/pirandai-thokku.jpg",
        imageTwo: "/assets/img/product/pirandai-thokku.jpg",
        category: "Thokku",
        oldPrice: '₹2.00',
        newPrice: 1,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "",
        sku: 24433,
        timer: "September 30, 2025 19:15:10 PDT",
        id: 3,
        quantity: 1,
        rating: 1,
        status: "In Stock",
        weight: "100g",
    },
    {
        title: "Tomato Thokku",
        sale: "",
        image: "/assets/img/product/tomato-thokku.jpg",
        imageTwo: "/assets/img/product/tomato-thokku.jpg",
        category: "Thokku",
        // oldPrice: 22,
        newPrice: 15,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "3 Left",
        sku: 24433,
        timer: "September 10, 2025 19:15:10 PDT",
        id: 4,
        quantity: 1,
        rating: 2,
        status: "Out Of Stock",
        weight: "3Pcs",
    },

    {
        title: "Onion Thokku",
        sale: "New",
        image: "/assets/img/product/onion-thokku.jpg",
        imageTwo: "/assets/img/product/onion-thokku.jpg",
        category: "Thokku",
        oldPrice: '₹22.00',
        newPrice: 9,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "Out Of Stock",
        sku: 24433,
        timer: "September 20, 2025 19:15:10 PDT",
        id: 8,
        quantity: 1,
        rating: 4,
        status: "In Stock",
        weight: "500g",
    },
    {
        title: "Garlic Thokku",
        sale: "New",
        image: "/assets/img/product/garlic-thokku.jpg",
        imageTwo: "/assets/img/product/garlic-thokku.jpg",
        category: "Thokku",
        oldPrice: '₹27.00',
        newPrice: 5,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "Out Of Stock",
        sku: 24433,
        timer: "September 10, 2025 19:15:10 PDT",
        id: 9,
        quantity: 1,
        rating: 3,
        status: "Out Of Stock",
        weight: "2Pcs",
    },

    {
        title: "Banana Flower Thokku",
        sale: "New",
        image: "/assets/img/product/1.jpg",
        imageTwo: "/assets/img/product/back-1.jpg",
        category: "Thokku",
        oldPrice: '₹10.00',
        newPrice: 9,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "2 Left",
        sku: 24433,
        timer: "September 01, 2025 19:15:10 PDT",
        id: 16,
        quantity: 1,
        rating: 3,
        status: "Out Of Stock",
        weight: "500g",
    },
    {
        title: "ABC Malt",
        sale: "Hot",
        image: "/assets/img/product/abc-malt.jpg",
        imageTwo: "/assets/img/product/abc-malt.jpg",
        category: "Malt",
        oldPrice: '₹22.00',
        newPrice: 15,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "",
        sku: 24433,
        timer: "September 11, 2025 19:15:10 PDT",
        id: 17,
        quantity: 1,
        rating: 4,
        status: "In Stock",
        weight: "500g",
    },

    {
        title: "Red Banana Malt",
        sale: "Trend",
        image: "/assets/img/product/red-banana-malt.jpg",
        imageTwo: "/assets/img/product/red-banana-malt.jpg",
        category: "Malt",
        // oldPrice: 0,
        newPrice: 1,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "Out Of Stock",
        sku: 24433,
        timer: "September 15, 2025 19:15:10 PDT",
        id: 20,
        quantity: 1,
        rating: 5,
        status: "In Stock",
        weight: "2Pcs",
    },

    {
        title: "Fig Malt",
        sale: "",
        image: "/assets/img/product/fig-malt.jpg",
        imageTwo: "/assets/img/product/fig-malt.jpg",
        category: "Malt",
        oldPrice: '₹21.00',
        newPrice: 9,
        location: "In Store",
        brand: "Bhisma Organics",
        itemLeft: "",
        sku: 24433,
        timer: "September 19, 2025 19:15:10 PDT",
        id: 24,
        quantity: 1,
        rating: 5,
        status: "In Stock",
        weight: "12Pcs",
    },
]

export default offer;