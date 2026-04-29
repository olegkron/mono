import { type FC, type CSSProperties, useState } from "react";
import styles from "./GridWidgets.module.css";

/* ---------- Public types ---------- */

export interface CtaConfig {
	label: string;
	onClick?: () => void;
	href?: string;
}

interface GridPlacement {
	/** 1-based column. Omit for auto-flow. */
	col?: number;
	/** 1-based row. Omit for auto-flow. */
	row?: number;
}

/** Small widget — eyebrow + large heading. CTA optional. */
export interface SmHeadingWidget extends GridPlacement {
	size: "sm";
	variant: "heading";
	eyebrow?: string;
	heading: string;
	subheading?: string;
	cta?: CtaConfig;
}

/** Small widget — avatar + subheading. CTA optional. */
export interface SmAvatarWidget extends GridPlacement {
	size: "sm";
	variant: "avatar";
	eyebrow?: string;
	avatar: { src: string; alt: string };
	subheading: string;
	cta?: CtaConfig;
}

/** Medium widget — may carry eyebrow + heading + subheading + CTA together. */
export interface MdWidget extends GridPlacement {
	size: "md";
	eyebrow?: string;
	heading: string;
	subheading?: string;
	cta?: CtaConfig;
}

export type GridWidget = SmHeadingWidget | SmAvatarWidget | MdWidget;

export interface GridWidgetsProps {
	widgets: GridWidget[];
	/** Defaults to 3. */
	cols?: number;
	/** Defaults to 4. */
	rows?: number;
}

/* ---------- CTA renderer (shared) ---------- */

const CtaButton: FC<{ cta: CtaConfig }> = ({ cta }) =>
	cta.href ? (
		<a className={styles.ctaButton} href={cta.href}>
			{cta.label}
		</a>
	) : (
		<button
			type="button"
			className={styles.ctaButton}
			onClick={cta.onClick}
		>
			{cta.label}
		</button>
	);

/* ---------- Widget renderers ---------- */

const SmHeadingView: FC<{ w: SmHeadingWidget }> = ({ w }) => (
	<>
		<div className={styles.cardTop}>
			{w.eyebrow && <span className={styles.eyebrow}>{w.eyebrow}</span>}
			<h3 className={styles.heading}>{w.heading}</h3>
			{w.subheading && (
				<p className={styles.subheading}>{w.subheading}</p>
			)}
		</div>
		{w.cta && (
			<div className={styles.cardBottom}>
				<CtaButton cta={w.cta} />
			</div>
		)}
	</>
);

const SmAvatarView: FC<{ w: SmAvatarWidget }> = ({ w }) => (
	<>
		<div className={styles.cardTop}>
			{w.eyebrow && <span className={styles.eyebrow}>{w.eyebrow}</span>}
			<span className={styles.imgPlaceholder}>
				<img
					className={styles.avatar}
					src={w.avatar.src}
					alt={w.avatar.alt}
					onError={(e) => { e.currentTarget.style.display = "none"; }}
				/>
			</span>
			<p className={styles.subheading}>{w.subheading}</p>
		</div>
		{w.cta && (
			<div className={styles.cardBottom}>
				<CtaButton cta={w.cta} />
			</div>
		)}
	</>
);

const MdView: FC<{ w: MdWidget }> = ({ w }) => (
	<>
		<div className={styles.cardTop}>
			{w.eyebrow && <span className={styles.eyebrow}>{w.eyebrow}</span>}
			<h3 className={styles.heading}>{w.heading}</h3>
			{w.subheading && (
				<p className={styles.subheading}>{w.subheading}</p>
			)}
		</div>
		{w.cta && (
			<div className={styles.cardBottom}>
				<CtaButton cta={w.cta} />
			</div>
		)}
	</>
);

function renderWidgetContent(w: GridWidget) {
	if (w.size === "md") return <MdView w={w} />;
	if (w.variant === "avatar") return <SmAvatarView w={w} />;
	return <SmHeadingView w={w} />;
}

/* ---------- Component ---------- */

export const GridWidgets: FC<GridWidgetsProps> = ({
	widgets,
	cols = 3,
	rows = 4,
}) => {
	const [fallen, setFallen] = useState<boolean[]>(() =>
		widgets.map(() => false),
	);

	const onAnimationEnd = (i: number) =>
		setFallen((prev) => {
			const next = [...prev];
			next[i] = true;
			return next;
		});

	return (
		<div
			className={styles.grid}
			style={{
				"--cols": cols,
				"--rows": rows,
			} as CSSProperties}
		>
			{widgets.map((w, i) => {
				const colSpan = w.size === "md" ? 2 : 1;
				const gridColumn =
					w.col != null
						? `${w.col} / span ${colSpan}`
						: `span ${colSpan}`;
				const gridRow = w.row != null ? `${w.row}` : "auto";

				const cls = [
					styles.card,
					w.size === "md" ? styles.cardMd : styles.cardSm,
					fallen[i] ? styles.cardFallen : "",
				]
					.filter(Boolean)
					.join(" ");

				return (
					<div
						key={i}
						className={cls}
						onAnimationEnd={() => onAnimationEnd(i)}
						style={{
							gridColumn,
							gridRow,
							"--delay": `${i * 80}ms`,
						} as CSSProperties}
					>
						{renderWidgetContent(w)}
					</div>
				);
			})}
		</div>
	);
};