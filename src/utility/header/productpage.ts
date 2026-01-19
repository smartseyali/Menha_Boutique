interface Product {
  name: string;
  href: string;
  subname: SubPage[];
}

interface SubPage {
  name: string;
  href: string;
}

const productpage: Product[] = [
  {
    name: "Product Page",
    href: "",
    subname: [
      { name: "Product Left Sidebar", href: "/product-left-sidebar" },
      { name: "Product Right Sidebar", href: "/product-right-sidebar" }
    ]
  },
  {
    name: "Product According",
    href: "",
    subname: [
      { name: "Left Sidebar", href: "/product-accordion-left-sidebar" },
      { name: "Right Sidebar", href: "/product-accordion-right-sidebar" }
    ]
  },
];
export default productpage;
