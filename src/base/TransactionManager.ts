import mongoose, { ClientSession } from 'mongoose';

export class TransactionManager {
  private session: ClientSession | null = null;

  async runs<T>(transactionFn: (session: ClientSession) => Promise<T>) {
    await this.#startSession();
    try {
      const result = await transactionFn(this.session!);
      await this.#commitTransaction();

      return result;
    } catch (error) {
      await this.#abortTransaction();
      throw error;
    }
  }

  async #commitTransaction(): Promise<void> {
    if (this.session) {
      await this.session.commitTransaction();
      this.#endSession();
    }
  }

  async #abortTransaction(): Promise<void> {
    if (this.session) {
      await this.session.abortTransaction();
      this.#endSession();
    }
  }

  #endSession(): void {
    if (this.session) {
      this.session.endSession();
    }
  }

  async #startSession() {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
  }
}
