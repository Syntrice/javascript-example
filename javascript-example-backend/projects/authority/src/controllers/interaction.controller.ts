import { Body, Controller, Get, Post, Request, Response, Params } from "@inversifyjs/http-core";
import { inject } from "inversify";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@javascript-example-backend/common";
import { OidcProviderService } from "../services/oidc-provider.service.js";
import Provider from "oidc-provider";

@Controller("/interaction")
export class InteractionController {
  private readonly provider: Provider;

  constructor(@inject(OidcProviderService) oidcProviderService: OidcProviderService) {
    this.provider = oidcProviderService.provider;
  }

  @Get("/:uid")
  public async showInteraction(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const interaction = await this.provider.interactionDetails(req, res);
    const { prompt, uid, params } = interaction;

    switch (prompt.name) {
      case "login":
        return res.render("login", { uid, params, flash: undefined });
      case "consent":
        return res.render("consent", {
          uid,
          params,
          scopes: prompt.details.missingOIDCScope,
          claims: prompt.details.missingOIDCClaims,
        });
      default:
        return res.render("error", {
          error: "Unsupported prompt",
          description: `Unknown interaction prompt: ${prompt.name}`,
        });
    }
  }

  @Post("/:uid/login")
  public async submitLogin(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Params() params: { uid: string },
    @Body() body: { email: string; password: string },
  ): Promise<void> {
    const interaction = await this.provider.interactionDetails(req, res);
    const { email, password } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render("login", {
        uid: params.uid,
        params: interaction.params,
        flash: "Invalid email or password",
      });
    }

    await this.provider.interactionFinished(req, res, {
      login: {
        accountId: user.id,
      },
    });
  }

  @Post("/:uid/confirm")
  public async confirmConsent(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const interaction = await this.provider.interactionDetails(req, res);

    let grant: InstanceType<typeof this.provider.Grant>;

    if (interaction.grantId) {
      grant = (await this.provider.Grant.find(interaction.grantId))!;
    } else {
      grant = new this.provider.Grant({
        accountId: interaction.session!.accountId,
        clientId: interaction.params.client_id as string,
      });
    }

    const missingScopes = interaction.prompt.details.missingOIDCScope as string[] | undefined;
    if (missingScopes) {
      grant.addOIDCScope(missingScopes.join(" "));
    }

    const missingClaims = interaction.prompt.details.missingOIDCClaims as string[] | undefined;
    if (missingClaims) {
      grant.addOIDCClaims(missingClaims);
    }

    const grantId = await grant.save();

    await this.provider.interactionFinished(req, res, {
      consent: { grantId },
    });
  }

  @Post("/:uid/abort")
  public async abortInteraction(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    await this.provider.interactionFinished(req, res, {
      error: "access_denied",
      error_description: "End-user aborted interaction",
    });
  }
}
