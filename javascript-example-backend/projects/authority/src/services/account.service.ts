import { injectable } from "inversify";
import type { Account } from "oidc-provider";
import { prisma } from "@javascript-example-backend/common";

@injectable()
export class AccountService {
  /**
   * @param id
   * @returns
   */
  public async findAccount(id: string): Promise<Account | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    return {
      accountId: user.id,
      async claims() {
        return {
          sub: user.id,
          email: user.email,
        };
      },
    };
  }
}
