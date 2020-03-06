import React, { useEffect } from 'react';
import { css } from 'emotion';

// Types
import { RichHistoryQuery } from 'app/types/explore';

// Utils
import { stylesFactory, useTheme } from '@grafana/ui';
import { GrafanaTheme, SelectableValue } from '@grafana/data';
import { getExploreDatasources } from '../state/selectors';

import { SortOrder } from '../../../core/utils/explore';
import { sortQueries } from '../../../core/utils/richHistory';

// Components
import { RichHistoryCard } from './RichHistoryCard';
import { sortOrderOptions } from './RichHistory';
import { Select } from '@grafana/ui';

interface Props {
  queries: RichHistoryQuery[];
  sortOrder: SortOrder;
  activeDatasourceOnly: boolean;
  activeDatasourceInstance: string;
  datasourceFilters: SelectableValue[] | null;
  onChangeSortOrder: (sortOrder: SortOrder) => void;
  onChangeRichHistoryProperty: (ts: number, property: string, updatedProperty?: string) => void;
  onSelectDatasourceFilters: (value: SelectableValue[] | null) => void;
}

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  const bgColor = theme.isLight ? theme.colors.gray5 : theme.colors.dark4;
  return {
    container: css`
      display: flex;
      .label-slider {
        font-size: ${theme.typography.size.sm};
        &:last-of-type {
          margin-top: ${theme.spacing.lg};
        }
        &:first-of-type {
          margin-top: ${theme.spacing.sm};
          font-weight: ${theme.typography.weight.semibold};
          margin-bottom: ${theme.spacing.xs};
        }
      }
    `,
    containerContent: css`
      width: 100%;
    `,
    selectors: css`
      display: flex;
      justify-content: space-between;
    `,
    multiselect: css`
      width: 60%;
      .gf-form-select-box__multi-value {
        background-color: ${bgColor};
        padding: ${theme.spacing.xxs} ${theme.spacing.xs} ${theme.spacing.xxs} ${theme.spacing.sm};
        border-radius: ${theme.border.radius.sm};
      }
    `,
    sort: css`
      width: 170px;
    `,
    sessionName: css`
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      margin-top: ${theme.spacing.lg};
      h4 {
        margin: 0 10px 0 0;
      }
    `,
    heading: css`
      font-size: ${theme.typography.heading.h4};
      margin: ${theme.spacing.md} ${theme.spacing.xxs} ${theme.spacing.sm} ${theme.spacing.xxs};
    `,
  };
});

export function RichHistoryStarredTab(props: Props) {
  const {
    datasourceFilters,
    onSelectDatasourceFilters,
    queries,
    onChangeSortOrder,
    sortOrder,
    onChangeRichHistoryProperty,
    activeDatasourceOnly,
    activeDatasourceInstance,
  } = props;

  const theme = useTheme();
  const styles = getStyles(theme);
  const exploreDatasources = getExploreDatasources()?.map(d => {
    return { value: d.value!, label: d.value!, imgUrl: d.meta.info.logos.small };
  });
  const listOfDatasourceFilters = datasourceFilters?.map(d => d.value);

  /* If user selects activeDatasourceOnly === true, set datasource filter to currently active datasource.
   *  Filtering based on datasource won't be available. Otherwise set to null, as filtering will be
   * available for user.
   */
  useEffect(() => {
    activeDatasourceOnly && activeDatasourceInstance
      ? onSelectDatasourceFilters([{ label: activeDatasourceInstance, value: activeDatasourceInstance }])
      : onSelectDatasourceFilters(null);
  }, [activeDatasourceInstance, activeDatasourceOnly]);

  const starredQueries = queries.filter(q => q.starred === true);
  const starredQueriesFilteredByDatasource = datasourceFilters
    ? starredQueries?.filter(q => listOfDatasourceFilters?.includes(q.datasourceName))
    : starredQueries;
  const sortedStarredQueries = sortQueries(starredQueriesFilteredByDatasource, sortOrder);

  return (
    <div className={styles.container}>
      <div className={styles.containerContent}>
        <div className={styles.selectors}>
          {!activeDatasourceOnly && (
            <div className={styles.multiselect}>
              <Select
                isMulti={true}
                options={exploreDatasources}
                value={datasourceFilters}
                placeholder="Filter queries for specific datasources(s)"
                onChange={onSelectDatasourceFilters}
              />
            </div>
          )}
          <div className={styles.sort}>
            <Select
              options={sortOrderOptions}
              placeholder="Sort queries by"
              onChange={e => onChangeSortOrder(e.value as SortOrder)}
            />
          </div>
        </div>
        {sortedStarredQueries.map(q => {
          return <RichHistoryCard query={q} key={q.ts} onChangeRichHistoryProperty={onChangeRichHistoryProperty} />;
        })}
      </div>
    </div>
  );
}
