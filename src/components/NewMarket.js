import React, { useState } from "react";
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import useDialog from "../hooks/useDialog";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserContext } from "../App";
const NewMarket = () => {
  const addMarketDialog = useDialog();
  const [name, setName] = useState("");
  const handleSetname = (val) => {
    setName(val);
  };
  const [tags, setTags] = useState(["Arts", "Technology", "Video Games"]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [options, setOptions] = useState([]);

  const handleAddMarket = async (user) => {
    try {
      const input = { name, owner: user.username, tags: selectedTags };
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      console.log(result);
      setName("");
      setSelectedTags([])
      addMarketDialog.handleClose();
    } catch (error) {
      console.log(error);
      Notification.error({
        title: "Error",
        message: "There was an error.",
      });
    }
  };

  const handleFilterTags = (query) => {
    const newTags = tags
      .map((el) => ({ value: el, label: el }))
      .filter((el) => el.label.toLowerCase().includes(query.toLowerCase()));
    setOptions(newTags);
  };

  return (
    <UserContext.Consumer>
      {({ user }) => (
        <>
          <div className="market-header">
            <h1 className="market-title">Create Your MarketPlace</h1>
            <Button
              type="text"
              icon="edit"
              className="market-title-button"
              onClick={addMarketDialog.handleOpen}
            />
          </div>
          <Dialog
            title="Create New Market"
            visible={addMarketDialog.open}
            onCancel={addMarketDialog.handleClose}
            size="large"
            customClass="dialog"
          >
            <Dialog.Body>
              <Form labelPosition="top">
                <Form.Item label="Add Market Name">
                  <Input
                    placeholder="Market Name"
                    trim={true}
                    value={name}
                    onChange={(val) => handleSetname(val)}
                  />
                </Form.Item>
                <Form.Item label="Add Tags">
                  <Select
                    remote
                    multiple
                    filterable
                    placeholder="Market Tags"
                    onChange={(newTags) => setSelectedTags(newTags)}
                    remoteMethod={handleFilterTags}
                  >
                    {options.map((option) => (
                      <Select.Option
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={addMarketDialog.handleClose}>Cancel</Button>
              <Button type="primary" onClick={() => handleAddMarket(user)}>
                Add
              </Button>
            </Dialog.Footer>
          </Dialog>
        </>
      )}
    </UserContext.Consumer>
  );
};

export default NewMarket;
