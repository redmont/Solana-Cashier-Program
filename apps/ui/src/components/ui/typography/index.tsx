import React from 'react';
import { cn as classNames } from '@/lib/utils';

type TypographyProps = {
  variant: 'header-secondary';
  children: React.ReactNode;
  className?: string;
};

const variantToTag = {
  'hero-header': 'h1',
  'section-header': 'h2',
  'header-secondary': 'h3',
  'body-text': 'p',
  link: 'a',
};

const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className,
  ...props
}) => {
  const Tag = variantToTag[variant] as keyof JSX.IntrinsicElements;
  return (
    <Tag className={classNames('typography', className, variant)} {...props}>
      {children}
    </Tag>
  );
};

export default Typography;
