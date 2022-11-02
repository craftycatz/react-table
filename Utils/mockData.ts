export interface MockData {
  date: Date;
  orderNumber: number;
  Patient: {
    id: number;
    firstName: string;
    lastName: string;
  };
  Laboratory: {
    id: number;
    name: string;
  };
  deliveryDate: Date;
  status: string;
}

const mockData: MockData[] = [
  {
    date: new Date("2022-01-01"),
    orderNumber: 1,
    Patient: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
    },
    Laboratory: {
      id: 1,
      name: "Lab 1",
    },
    deliveryDate: new Date("2022-11-11"),
    status: "In Progress",
  },
  {
    date: new Date("2022-10-03"),
    orderNumber: 2,
    Patient: {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
    },
    Laboratory: {
      id: 2,
      name: "Lab 2",
    },
    deliveryDate: new Date("2022-12-11"),
    status: "In Progress",
  },
  {
    date: new Date("2022-09-08"),
    orderNumber: 3,
    Patient: {
      id: 3,
      firstName: "Max",
      lastName: "Mustermann",
    },
    Laboratory: {
      id: 3,
      name: "Lab 3",
    },
    deliveryDate: new Date("2022-11-09"),
    status: "Done",
  },
  {
    date: new Date("2022-03-01"),
    orderNumber: 4,
    Patient: {
      id: 4,
      firstName: "Marta",
      lastName: "Musterfrau",
    },
    Laboratory: {
      id: 4,
      name: "Lab 4",
    },
    deliveryDate: new Date("2022-04-05"),
    status: "Cancelled",
  },
];

export const getMockData = () => mockData;
