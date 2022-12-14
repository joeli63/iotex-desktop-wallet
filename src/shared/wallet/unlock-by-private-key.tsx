import Button from "antd/lib/button";
import Form, {FormComponentProps} from "antd/lib/form/Form";
import Input from "antd/lib/input";
import {get} from "dottie";
// @ts-ignore
import {t} from "onefx/lib/iso-i18n";
import React, {PureComponent} from "react";
import {connect, DispatchProp} from "react-redux";
import {CommonMargin} from "../common/common-margin";
import {getAntenna} from "./get-antenna";
import {FormItemLabel} from "./wallet";
import {setAccount} from "./wallet-actions";

export interface State {
  priKey: string;
}

export interface Props extends DispatchProp {}

class UnlockByPrivateKeyInner extends PureComponent<
  Props & FormComponentProps,
  State
> {
  public state: State = {
    priKey: ""
  };

  public handleInputChange = (e: React.FormEvent) => {
    const name: string = get(e, "target.name");
    const value = get(e, "target.value");
    // @ts-ignore
    this.setState({
      [name]: value
    });
  };

  public unlockWallet = async () => {
    this.props.form.validateFields(async err => {
      if (!err) {
        const { priKey } = this.state;
        const antenna = getAntenna(true);
        const account = await antenna.iotx.accounts.privateKeyToAccount(priKey);
        this.props.dispatch(setAccount(account));
      }
    });
  };

  public render(): JSX.Element {
    const { priKey } = this.state;
    const { getFieldDecorator } = this.props.form;
    const validPrikey = priKey.length === 64;

    return (
      <React.Fragment>
        <CommonMargin />
        <Form layout="vertical">
          <Form.Item
            label={
              <FormItemLabel>
                {t("wallet.account.enterPrivateKey")}
              </FormItemLabel>
            }
          >
            {getFieldDecorator("priKey", {
              rules: [
                {
                  required: true,
                  message: t("input.error.private_key.invalid")
                },
                {
                  len: 64,
                  message: t("input.error.private_key.length")
                }
              ]
            })(
              <Input.Password
                className="form-input"
                placeholder={t("wallet.account.placehold.privateKey")}
                type="password"
                name="priKey"
                autoComplete="on"
                allowClear={true}
                onChange={e => this.handleInputChange(e)}
              />
            )}
          </Form.Item>
          <Button
            htmlType="submit"
            disabled={!validPrikey}
            onClick={this.unlockWallet}
          >
            {t("wallet.account.unlock")}
          </Button>
        </Form>
      </React.Fragment>
    );
  }
}

export const UnlockByPrivateKey = Form.create()(
  connect()(UnlockByPrivateKeyInner)
);
