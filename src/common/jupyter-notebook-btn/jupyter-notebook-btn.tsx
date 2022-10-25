import React, { useState } from 'react';
import moment from 'moment';
import {
  Popover,
  Button,
  Form,
  Input,
  TimePicker,
  InputNumber,
  Select,
  Row,
  Col,
  notification,
} from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';

import {
  DEFAULT_PARTITION,
  DEFAULT_CPUS,
  DEFAULT_MEM,
  DEFAULT_ALLOCATION_TIME,
  API_TOKEN_KEY,
  PARTITIONS,
} from './config';

import {
  waitServerReady,
  getNotebookUrl,
  getRunAllocationBaseUrl,
} from './api';

import { ApiServer } from './types';

import './jupyter-notebook-btn.css';

const { Option } = Select;
const TIME_FORMAT = 'HH:mm';

export interface JupyterNotebookBtnProps {
  path: string;
  account: string;
  className?: string;
  nexus: NexusClient;
}

export const JupyterNotebookBtn = (props: JupyterNotebookBtnProps) => {
  const { nexus } = props;

  const [popoverVisible, setPopoverVisible] = useState(false);

  const [serverName, setServerName] = useState('');
  const [partition, setPartition] = useState(DEFAULT_PARTITION);
  const [cpus, setCpus] = useState(DEFAULT_CPUS);
  const [memory, setMemory] = useState(DEFAULT_MEM);
  const [account, setAccount] = useState(props.account);
  const [allocationTime, setAllocationTime] = useState(DEFAULT_ALLOCATION_TIME);
  const [apiToken, setApiToken] = useState(
    localStorage.getItem(API_TOKEN_KEY) || ''
  );

  const [allocationRunning, setAllocationRunning] = useState(false);

  const [notebookUrl, setNotebookUrl] = useState('');
  const [allocationExpire, setAllocationExpire] = useState('');

  const configFormDisabled = !!notebookUrl || !!allocationRunning;

  const allocateBtnActive = account && apiToken;

  const onPopoverVisibleChange = (visible: boolean) => {
    setPopoverVisible(allocationRunning || visible);
  };

  const runAllocation = async () => {
    setAllocationRunning(true);
    localStorage.setItem(API_TOKEN_KEY, apiToken || '');

    const identityRes = await nexus.Identity.list();
    const identity = identityRes.identities.find(
      identity => identity['@type'] === 'User'
    );

    if (!identity) {
      throw new Error('No User identity found');
    }

    const userName = identity.subject;
    if (!userName) {
      throw new Error('No subject found in User identity');
    }

    const runAllocationUrl = getRunAllocationBaseUrl(userName, serverName);

    const notebookUrl = getNotebookUrl(userName, serverName);

    try {
      const allocationRes = await fetch(runAllocationUrl, {
        method: 'post',
        headers: new Headers({
          Authorization: `token ${apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          account,
          partition,
          cpus,
          memory: `${memory}gb`,
          timelimit: allocationTime.format('HH:mm:ss'),
        }),
      });

      if (!allocationRes.ok && allocationRes.status !== 400) {
        notification.error({ message: 'JupyterHub API error' });
        return;
      }

      let server: ApiServer;

      try {
        server = await waitServerReady(apiToken, userName, serverName);
      } catch {
        notification.error({
          message: 'Allocation or notebook run error',
        });
        return;
      }

      const allocationStartTime = moment(server.started);
      const [
        allocHours,
        allocMinutes,
        allocSeconds,
      ] = server.user_options.timelimit.split(':').map(parseInt);

      const allocDuration = moment.duration({
        hours: allocHours,
        minutes: allocMinutes,
        seconds: allocSeconds,
      });

      const allocationEndTime = allocationStartTime.clone().add(allocDuration);

      setAllocationExpire(moment().to(allocationEndTime));

      setNotebookUrl(notebookUrl);
    } catch (error) {
      notification.error({
        message: 'Error contacting JupyterHub API',
        description: (
          <span>
            If your network connection is up, ensure that your browser trusts{' '}
            <a href={notebookUrl} target="_blank" rel="noopener noreferrer">
              JupyterHub
            </a>{' '}
            https certificate.
          </span>
        ),
        duration: 9,
      });
    } finally {
      setAllocationRunning(false);
    }
  };

  return (
    <Popover
      content={
        <div style={{ width: 380 }}>
          <Form
            className="small-form"
            layout="horizontal"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
          >
            <Form.Item required label="Account">
              <Input
                value={account}
                size="small"
                disabled={configFormDisabled}
                onChange={e => setAccount(e.target.value)}
              />
            </Form.Item>
            <Form.Item required label="Partition">
              <Select
                defaultValue={partition}
                size="small"
                disabled={configFormDisabled}
                onChange={(partition: string) => setPartition(partition)}
              >
                {PARTITIONS.map(partition => (
                  <Option value={partition} key={partition}>
                    {partition}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item required label="CPUs">
              <InputNumber
                value={cpus}
                style={{ width: '100%' }}
                size="small"
                min={1}
                max={144}
                disabled={configFormDisabled}
                onChange={cpus => cpus && setCpus(cpus as number)}
                onPressEnter={() => runAllocation()}
              />
            </Form.Item>
            <Form.Item required label="Memory, GB">
              <InputNumber
                value={memory}
                style={{ width: '100%' }}
                size="small"
                min={1}
                max={768}
                disabled={configFormDisabled}
                onChange={memory => memory && setMemory(memory as number)}
                onPressEnter={() => runAllocation()}
              />
            </Form.Item>
            <Form.Item required label="Allocation time">
              <TimePicker
                defaultValue={allocationTime}
                className="width-100"
                size="small"
                format={TIME_FORMAT}
                minuteStep={15}
                disabled={configFormDisabled}
                onChange={time => time && setAllocationTime(time)}
              />
            </Form.Item>
            {/* <Form.Item label="Server name">
              <Input
                value={serverName}
                size="small"
                placeholder="default"
                disabled={configFormDisabled}
                onChange={e => setServerName(e.target.value)}
              />
            </Form.Item> */}
            <Form.Item required label="JupyterHub API token">
              <Row gutter={8}>
                <Col span={14}>
                  <Input.Password
                    value={apiToken}
                    size="small"
                    autoComplete="jupyterhub-api-token"
                    disabled={configFormDisabled}
                    onChange={e => setApiToken(e.target.value)}
                  />
                </Col>
                <Col span={10}>
                  <Button
                    block
                    size="small"
                    href="https://bbpcb103.bbp.epfl.ch/hub/token"
                    target="_blank"
                  >
                    Get token
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>

          {notebookUrl ? (
            <div className="text-right mt">
              <Button type="link" href={notebookUrl} target="_blank">
                Click here to open a notebook
              </Button>
              <br />
              <span className="mr inline-block">
                Allocation expires {allocationExpire}
              </span>
            </div>
          ) : (
            <div className="text-right mt">
              <Button
                type="primary"
                disabled={!allocateBtnActive}
                loading={allocationRunning}
                onClick={() => runAllocation()}
              >
                {allocationRunning
                  ? 'Allocating resources'
                  : 'Allocate and run'}
              </Button>
            </div>
          )}
        </div>
      }
      trigger="click"
      title="Open Notebook"
      visible={popoverVisible}
      onVisibleChange={visible => onPopoverVisibleChange(false)}
    >
      <Button disabled className={props.className}>Open Notebook</Button>
    </Popover>
  );
};

export default JupyterNotebookBtn;
