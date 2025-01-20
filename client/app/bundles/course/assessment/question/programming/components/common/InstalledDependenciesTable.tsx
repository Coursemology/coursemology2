import { LanguageDependencyData } from 'types/course/assessment/question/programming';

import translations from 'course/assessment/translations';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface InstalledDependenciesTableProps {
  className?: string;
  dependencies: LanguageDependencyData[];
}

const InstalledDependenciesTable = (
  props: InstalledDependenciesTableProps,
): JSX.Element => {
  const { className, dependencies } = props;
  const { t } = useTranslation();

  const columns: ColumnTemplate<LanguageDependencyData>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: true,
      searchable: true,
      cell: (dependency: LanguageDependencyData): string | JSX.Element => {
        const title = dependency.title ?? dependency.name;
        if (dependency.href) {
          return (
            <Link href={dependency.href} opensInNewTab underline="hover">
              {title}
            </Link>
          );
        }
        return title;
      },
      searchProps: {
        getValue: (datum: LanguageDependencyData): string => {
          const keywords = [datum.name];
          if (datum.title) keywords.push(datum.title);
          if (datum.aliases) keywords.push(...datum.aliases);
          return keywords.join(', ');
        },
      },
    },
    {
      of: 'version',
      title: t(translations.dependencyVersionTableHeading),
      cell: (dependency) => dependency.version,
    },
  ];

  return (
    <Table
      className={className}
      columns={columns}
      data={dependencies}
      getRowId={(dependency): string =>
        `${dependency.name} ${dependency.version}`
      }
      indexing={{ indices: false }}
      search={{
        searchPlaceholder: t(translations.dependencySearchText),
      }}
      toolbar={{
        show: true,
      }}
    />
  );
};

export default InstalledDependenciesTable;
