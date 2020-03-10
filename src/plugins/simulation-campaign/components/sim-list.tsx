import React, { useState } from 'react';
import moment from 'moment';
import { Table, Badge, Button, Icon } from 'antd';

import { Simulation } from '../types';

import './sim-list.css';

interface BadgeStatus {
  [simStatus: string]:
    | 'default'
    | 'processing'
    | 'error'
    | 'success'
    | 'warning';
}

interface SimulationListProps {
  simulations: Simulation[];
  goToResource?: (selfUrl: string) => void;
}

const badgeStatus: BadgeStatus = {
  Pending: 'default',
  Running: 'processing',
  Failed: 'error',
  Done: 'success',
};

function getTableColumns(additionalColumns: string[], simStatuses: string[]) {
  return [
    {
      title: 'Simulations',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) =>
        name ? (name.length > 70 ? `...${name.slice(-67)}` : name) : '',
    },
    additionalColumns.includes('ca')
      ? {
          title: 'Ca',
          dataIndex: 'ca',
          key: 'ca',
          width: 60,
          sorter: (a: any, b: any) => parseFloat(a.ca) - parseFloat(b.ca),
        }
      : null,
    additionalColumns.includes('depolarization')
      ? {
          title: 'Depolarization',
          dataIndex: 'depolarization',
          key: 'depolarization',
          width: 120,
          sorter: (a: any, b: any) =>
            parseFloat(a.depolarization) - parseFloat(b.depolarization),
        }
      : null,
    {
      title: 'Started at',
      dataIndex: 'startedAtTime',
      key: 'startedAtTime',
      width: 150,
      render: (timeStr: string) => moment(timeStr).format('L HH:mm'),
      sorter: (a: any, b: any) =>
        moment(a.startedAtTime).diff(moment(b.startedAtTime)),
    },
    {
      title: 'Ended at',
      dataIndex: 'endedAtTime',
      key: 'endedAtTime',
      width: 150,
      render: (timeStr: string | null) =>
        timeStr ? moment(timeStr).format('L HH:mm') : '-',
      sorter: (a: any, b: any) =>
        moment(b.endedAtTime).diff(moment(a.endedAtTime)),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Badge status={badgeStatus[status]} text={status} />
      ),
      filters:
        simStatuses.length > 1
          ? simStatuses.map(status => ({ text: status, value: status }))
          : [],
      onFilter: (status: any, record: any) => record.status === status,
    },
  ].filter(Boolean);
}

const SimulationList = (props: SimulationListProps) => {
  const { simulations, goToResource } = props;

  const [expanded, setExpanded] = useState(false);

  const expandable = simulations.length > 8;

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const additionalColumns: string[] = [];
  if (simulations.some(simulation => !!simulation.ca)) {
    additionalColumns.push('ca');
  }
  if (simulations.some(simulation => !!simulation.depolarization)) {
    additionalColumns.push('depolarization');
  }
  const simStatuses = Array.from(new Set(simulations.map(sim => sim.status)));
  const simulationTableColumns = getTableColumns(
    additionalColumns,
    simStatuses
  );

  return (
    <div className="mt">
      <Table
        className="small-table campaign-simulations-table"
        dataSource={simulations}
        columns={simulationTableColumns as any}
        rowKey={row => row.self}
        pagination={false}
        scroll={{ y: expanded && expandable ? false : 340 }}
        size="middle"
        bordered
        onRow={data => ({
          onClick: () => goToResource && goToResource(data.self),
        })}
      />

      <div className="text-right">
        {expandable ? (
          <Button className="expand-sim-list-btn" onClick={toggleExpand}>
            {expanded ? 'Show less' : 'Show more'}
            <Icon type={expanded ? 'shrink' : 'arrows-alt'} />
          </Button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default SimulationList;
