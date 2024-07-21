import React from 'react';

type TypographyProps = {
  variant: 'header-secondary';
  children: React.ReactNode;
  [key: string]: any;
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
  ...props
}) => {
  const Tag = variantToTag[variant] as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`typography ${variant}`} {...props}>
      {children}
    </Tag>
  );
};

export default Typography;
