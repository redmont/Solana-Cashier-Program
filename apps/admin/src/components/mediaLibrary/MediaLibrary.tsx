import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { MediaCard } from './MediaCard';
import { AiOutlineCaretRight } from 'react-icons/ai';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export const MediaLibrary = ({
  path,
  onChangePath,
  onSelect,
}: {
  path: string[] | null;
  onChangePath: (path: string) => void;
  onSelect?: (path: string) => void;
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => {
    let b = [{ path: '/', name: 'Media library' }];

    if (path) {
      path.forEach((p, i) => {
        b.push({
          path: b[i].path + p,
          name: p,
        });
      });
    }

    return b;
  }, [path]);

  const apiPath = useMemo(() => {
    if (path) {
      return `media-library/files?path=${path.join('/')}`;
    }
    return 'media-library/files';
  }, [path]);

  const { isPending, error, data } = useQuery<
    {
      name: string;
      mimeType: string;
      thumbnailFileName: string;
    }[]
  >({
    queryKey: [apiPath],
  });

  const mediaItems = useMemo(() => data ?? [], [data]);

  const onClick = (name: string) => {
    setSelectedItem(name);
    if (onSelect) {
      onSelect(name);
    }
  };

  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={
          <Icon
            as={AiOutlineCaretRight}
            color="gray.500"
            verticalAlign="text-bottom"
          />
        }
      >
        {breadcrumbs.map((breadcrumb) => (
          <BreadcrumbItem key={breadcrumb.path}>
            <BreadcrumbLink onClick={() => onChangePath(breadcrumb.path)}>
              {breadcrumb.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      <Wrap>
        {mediaItems?.map(({ name, mimeType, thumbnailFileName }, i) => (
          <WrapItem key={`${name}-${i}`}>
            <MediaCard
              name={name}
              mimeType={mimeType}
              thumbnailFileName={thumbnailFileName}
              onClick={(name) => onClick(name)}
              selected={selectedItem === name}
            />
          </WrapItem>
        ))}
        {mediaItems?.length === 0 && <Text>No items to display</Text>}
      </Wrap>
    </>
  );
};
