interface Blog {
    name: string;
    image: string;
    date: string;
    title: string;
    description: string;
}

const testimonials: Blog[] = [
    {
        image: "/assets/img/testimonials/1.jpg",
        name: "Isabella Oliver",
        date: "June 30,2022",
        title: "(Manager)",
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
    {
        image: "/assets/img/testimonials/2.jpg",
        date: "April 02,2022",
        name: "Nikki Albart",
        title: "(Team Leader)",
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
    {
        image: "/assets/img/testimonials/3.jpg",
        date: "Mar 09,2022",
        name: "Stephen Smith",
        title: "(Co Founder)",
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
];
export default testimonials;
