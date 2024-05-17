import {draftMode} from "next/headers";
import {notFound} from "next/navigation";
import Image from "next/image";
import {RichText} from "basehub/react-rich-text";
import {cx} from "class-variance-authority";

import {Pump} from ".basehub/react-pump";
import {Section} from "@/common/layout";
import {authorFragment} from "@/lib/basehub/fragments";
import {Heading} from "@/common/heading";
import {Avatar} from "@/common/basehub-avatar";
import {isDev} from "@/utils/constants";

export default async function BlogPage({params: {slug}}: {params: {slug: string}}) {
  return (
    <main>
      <Pump
        draft={draftMode().isEnabled || isDev}
        queries={[
          {
            blogposts: {
              __args: {
                filter: {
                  _sys_slug: {
                    eq: slug,
                  },
                },
                first: 1,
              },
              items: {
                _title: true,
                description: true,
                authors: authorFragment,
                publishedAt: true,
                image: {
                  alt: true,
                  width: true,
                  height: true,
                  aspectRatio: true,
                  url: {
                    __args: {
                      width: 1440,
                      height: 720,
                      quality: 90,
                      format: "webp",
                    },
                  },
                },
                introduction: true,
                body: {
                  json: {
                    __typename: true,
                    blocks: {
                      __typename: true,
                      on_FaqItemComponent: {
                        _id: true,
                        __typename: true,
                        _idPath: true,
                        _title: true,
                        answer: true,
                      },
                      on_RichTextCalloutComponent: {
                        _title: true,
                        type: true,
                        _id: true,
                        __typename: true,
                        _idPath: true,
                      },
                    },
                    content: 1,
                    toc: 1,
                  },
                },
              },
            },
          },
        ]}
      >
        {async ([{blogposts}]) => {
          "use server";
          const blogpost = blogposts.items.at(0);

          if (!blogpost) return notFound();

          return (
            <>
              <Section>
                <Heading subtitle={blogpost.description}>
                  <h1>{blogpost._title}</h1>
                </Heading>
                <div className="flex items-center gap-16">
                  {blogpost.authors.map((author) => (
                    <figure key={author._id} className="flex items-center gap-2">
                      <Avatar key={author._id} {...author.image} />
                      {author._title}
                    </figure>
                  ))}
                </div>
              </Section>
              <Image
                alt={blogpost.image.alt ?? blogpost._title}
                className="h-full max-h-[720px] w-full object-cover"
                height={720}
                src={blogpost.image.url}
                style={{aspectRatio: blogpost.image.aspectRatio}}
                width={1440}
              />
              <Section>
                <div
                  className={cx("prose prose-zinc dark:prose-invert max-w-prose text-start", "")}
                >
                  <p className="text-2xl font-light">{blogpost.introduction}</p>
                  <RichText
                    components={{
                      code: ({children, code, isInline, language}) => {
                        if (isInline)
                          return (
                            <code className="prose-code:px-2 prose-code:pb-0.5 prose-code:border-b-surface-secondary dark:prose-code:bg-dark-surface-secondary prose-code:border prose-code:border-border dark:prose-code:border-dark-border prose-code:text-neutral-500">
                              {children}
                            </code>
                          );
                        else return <pre>{children}</pre>;
                      },
                    }}
                  >
                    {blogpost.body.json.content}
                  </RichText>
                </div>
              </Section>
            </>
          );
        }}
      </Pump>
    </main>
  );
}
