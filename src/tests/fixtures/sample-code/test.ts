// Test TypeScript file for fixture testing

export interface TestInterface {
  id: number
  name: string
  active: boolean
}

export class TestClass {
  constructor(private data: TestInterface) {}

  getName(): string {
    return this.data.name
  }

  isActive(): boolean {
    return this.data.active
  }
}