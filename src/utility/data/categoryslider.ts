interface Category {
  name: string;
  persantine: string;
  icon: string;
  image: string;
  item: number;
  num: number;
  number: number;
}

const categoryslider: Category[] = [
  {
    persantine: "30%",
    icon: "fi fi-tr-peach",
    image: "/assets/img/category/1.svg",
    name: "Thokku",
    item: 485,
    num: 1,
    number: 200,
  },
  {
    persantine: "",
    icon: "fi fi-tr-bread",
    image: "/assets/img/category/2.svg",
    name: "Malt",
    item: 291,
    num: 2,
    number: 400,
  },
  {
    persantine: "15%",
    icon: "fi fi-tr-corn",
    image: "/assets/img/category/3.svg",
    name: "Fruits ",
    item: 49,
    num: 3,
    number: 600,
  },
  {
    persantine: "10%",
    icon: "fi fi-tr-coffee-pot",
    image: "/assets/img/category/4.svg",
    name: "Masalas & Spices",
    item: 8,
    num: 4,
    number: 800,
  },
  {
    persantine: "",
    icon: "fi fi-tr-french-fries",
    image: "/assets/img/category/5.svg",
    name: "Red Banana Malt",
    item: 291,
    num: 1,
    number: 800,
  },
  {
    persantine: "",
    icon: "fi fi-tr-hamburger-soda",
    image: "/assets/img/category/6.svg",
    name: "Fig Malt",
    item: 49,
    num: 2,
    number: 800,
  },
];
export default categoryslider;
