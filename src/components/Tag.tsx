import { type FC } from "react";
import styles from "./Tag.module.css";

export interface TagProps {
    title: string;
}

export const Tag: FC<TagProps> = ({title}) => {
    return (
        <div className={styles.container}>
            <p>{title}</p>
        </div>
    );
};

export const Tags: FC<{ tags: string[] }> = ({ tags }) => {
    return (
        <div className={styles.tagsContainer}>
            {tags.map((tag) => (
                <Tag title={tag} key={tag}/>
            ))}
        </div>
    );
};
