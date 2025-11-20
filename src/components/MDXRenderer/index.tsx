import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import styles from './MDXRenderer.module.css';

export default function MDXRenderer({ md }: { md: string }) {
  return (
    <article className={styles.root}>
      <MDXRemote
        source={md}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: { light: 'github-light', dark: 'github-dark' },
                  keepBackground: true, // 让 <pre> 注入 --shiki-*-bg，便于肉眼确认
                },
              ],
            ],
          },
        }}
      />
    </article>
  );
}
