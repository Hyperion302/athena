import * as common from "../src";

describe("Serialize", () => {
  it("Correctly serializes an action", () => {
    const action: common.KickAction = {
      action: common.Action.Kick,
      user: {
        type: common.ReferenceType.ID,
        id: "181200777916710912", // Reese
      },
    };
    const serialized = common.serialize(action);
    expect(serialized).toMatchInlineSnapshot(
      `"{\\"action\\":0,\\"user\\":{\\"type\\":1,\\"id\\":\\"181200777916710912\\"}}"`
    );
  });

  it("Correctly serializes a proposal", () => {
    const proposal: common.Proposal = {
      id: "181200777916710912",
      author: "181200777916710912",
      server: "181200777916710912",
      createdOn: new Date(1611977362000),
      expiresOn: null,
      duration: 300,
      name: "New Proposal!",
      description: "New proposal made just for tests",
      status: common.ProposalStatus.Building,
    };
    const serialized = common.serialize(proposal);
    expect(serialized).toMatchInlineSnapshot(
      `"{\\"id\\":\\"181200777916710912\\",\\"author\\":\\"181200777916710912\\",\\"server\\":\\"181200777916710912\\",\\"createdOn\\":1611977362,\\"expiresOn\\":null,\\"duration\\":300,\\"name\\":\\"New Proposal!\\",\\"description\\":\\"New proposal made just for tests\\",\\"status\\":0}"`
    );
  });

  it("Correctly serializes a server", () => {
    const server: common.Server = {
      id: "181200777916710912",
      name: "United Republic of Chad",
      icon: "alsdfjalsdfjalsdfjlasdf",
    };
    const serialized = common.serialize(server);
    expect(serialized).toMatchInlineSnapshot(
      `"{\\"id\\":\\"181200777916710912\\",\\"name\\":\\"United Republic of Chad\\",\\"icon\\":\\"alsdfjalsdfjalsdfjlasdf\\"}"`
    );
  });

  it("Correctly serializes votes", () => {
    const votes: common.Votes = {
      [common.Vote.Yes]: 9,
      [common.Vote.No]: 10,
      [common.Vote.Abstain]: 2,
    };
    const serialized = common.serialize(votes);
    expect(serialized).toMatchInlineSnapshot();
  });
});

describe("Deserialize", () => {
  it("Correctly deserializes an action", () => {});

  it("Correctly deserializes a proposal", () => {});
  it("Correctly deserializes a server", () => {});
});
