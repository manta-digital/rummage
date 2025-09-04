import React from 'react';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatDate';
import { BaseCard, CardContent, CardDescription, CardHeader, CardTitle } from './BaseCard';

export interface BlogCardWideProps {
  imageMaxHeight?: string;
  title: string;
  date?: string | Date;
  excerpt?: string;
  slug?: string;
  coverImageUrl?: string;
  category?: string;
  author?: string;
  className?: string;
  // Dependency injection props
  ImageComponent?: React.ComponentType<any>;
  LinkComponent?: React.ComponentType<any>;
}

const BlogCardWide: React.FC<BlogCardWideProps> = ({
  title,
  date,
  excerpt,
  slug,
  coverImageUrl,
  category,
  author,
  className,
  imageMaxHeight,
  ImageComponent = 'img',
  LinkComponent = 'a',
  ...props
}) => {
  const formattedDate = date ? formatDate(date) : null;

  const cardContent = (
    <BaseCard
      className={cn(
        'p-0 overflow-hidden flex flex-col md:flex-row',
        className
      )}
      {...props}
    >
      {coverImageUrl && (
        <div className={cn('relative w-full md:w-1/3', imageMaxHeight ?? 'aspect-[16/9] md:aspect-auto')}>
          <ImageComponent
            src={coverImageUrl}
            alt={title}
            fill={ImageComponent !== 'img'}
            className="md:rounded-l-lg md:rounded-t-none rounded-t-lg object-cover"
            {...(ImageComponent === 'img' && { style: { width: '100%', height: '100%' } })}
          />
        </div>
      )}
      <div className="flex flex-col p-8 w-full md:w-2/3">
        <CardHeader className="p-0">
          <CardTitle className="line-clamp-2">{title}</CardTitle>
          <CardDescription>
            {author && <span className="text-xs">{author}</span>}
            {author && formattedDate && ' ・ '}
            {formattedDate && <span className="text-xs">{formattedDate}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 grow flex flex-col">
          {excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {excerpt}
            </p>
          )}
          {category && (
            <p className="text-xs bg-secondary text-secondary-foreground inline-block px-2 py-1 rounded-full mt-auto self-start">
              {category}
            </p>
          )}
        </CardContent>
      </div>
    </BaseCard>
  );

  return slug ? (
    <LinkComponent href={slug} className="contents">
      {cardContent}
    </LinkComponent>
  ) : (
    cardContent
  );
};

export { BlogCardWide };