import type { GridWidget } from "../components/GridWidgets";

export const homeWidgets: GridWidget[] = [
	// Row 1
	{
		size: "sm",
		variant: "heading",
		eyebrow: "Project Alpha",
		heading: "120%",
		subheading: "Latency improvement",
		col: 1,
		row: 1,
	},
	{
		size: "sm",
		variant: "avatar",
		avatar: { src: "/instagram.png", alt: "Instagram logo" },
		subheading: "Instagram",
		cta: { label: "Follow", href: "https://instagram.com/alex" },
		col: 2,
		row: 1,
	},
	{
		size: "sm",
		variant: "avatar",
		avatar: { src: "/x.png", alt: "X logo" },
		subheading: "X / Twitter",
		cta: { label: "Follow", href: "https://x.com/alex" },
		col: 3,
		row: 1,
	},
	// Row 2 — md spans cols 1–2
	{
		size: "md",
		eyebrow: "Experience",
		heading: "6 years",
		subheading: "Full-Stack experience in high-load systems",
		col: 1,
		row: 2,
	},
];
