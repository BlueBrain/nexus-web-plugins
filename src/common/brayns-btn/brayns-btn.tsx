import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Popover, Select } from 'antd';
import qs from 'query-string';

import './brayns-btn.css';

export interface BraynsBtnProps {
  className?: string;
  account: string;
  configPath: string;
}

const { Option } = Select;

const BRAYNS_BASE_URL = 'http://webbrayns.ocp.bbp.epfl.ch';

const PARTITIONS = ['prod', 'prod_small', 'interactive'];

const DEFAULT_PARTITION = PARTITIONS[0];
const DEFAULT_CPUS = 36;
const DEFAULT_MEM = 192;

export const BraynsBtn = (props: BraynsBtnProps) => {
  const [popoverVisible, setPopoverVisible] = useState(false);

  const [partition, setPartition] = useState(DEFAULT_PARTITION);
  const [cpus, setCpus] = useState(DEFAULT_CPUS);
  const [memory, setMemory] = useState(DEFAULT_MEM);
  const [account, setAccount] = useState(props.account);

  const runBtnActive = account && cpus && memory;

  const openBrayns = () => {
    setPopoverVisible(false);

    const braynsConfig = {
      account,
      partition,
      cpus,
      memory: memory * 1024,
      host: 'auto',
      load: props.configPath,
    };

    const query = qs.stringify(braynsConfig, { encode: false });
    const braynsUrl = `${BRAYNS_BASE_URL}/?${query}`;
    window.open(braynsUrl, '_blank');
  };

  return (
    <Popover
      trigger="click"
      title="Open in Brayns"
      visible={popoverVisible}
      onVisibleChange={visible => setPopoverVisible(false)}
      content={
        <div style={{ width: 240 }}>
          <Form
            className="small-form"
            layout="horizontal"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
          >
            <Form.Item required label="Account">
              <Input
                value={account}
                size="small"
                onChange={e => setAccount(e.target.value)}
              />
            </Form.Item>

            <Form.Item required label="Partition">
              <Select
                defaultValue={PARTITIONS[0]}
                size="small"
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
                onChange={cpus => {
                  cpus && setCpus(cpus as number);
                }}
                onPressEnter={() => openBrayns()}
              />
            </Form.Item>

            <Form.Item required label="Memory, GB">
              <InputNumber
                value={memory}
                style={{ width: '100%' }}
                size="small"
                min={8}
                max={768}
                onChange={memory => {
                  memory && setMemory(memory as number);
                }}
                onPressEnter={() => openBrayns()}
              />
            </Form.Item>
          </Form>

          <div className="text-right mt">
            <Button
              type="primary"
              disabled={!runBtnActive}
              onClick={() => openBrayns()}
            >
              Ok
            </Button>
          </div>
        </div>
      }
    >
      <Button disabled className={props.className}>Open in Brayns</Button>
    </Popover>
  );
};

export default BraynsBtn;
