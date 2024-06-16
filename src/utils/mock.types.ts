export type MockType<T> = Partial<{
  [P in keyof T]: jest.Mock<unknown>;
}>;
