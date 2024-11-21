import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"

createProductsWorkflow.hooks.productsCreated(
    (async ({ products, additional_data }, { container }) => {
        if (!additional_data?.brand_id) {
            return new StepResponse([], [])
        }

        // check that brand exists
        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )
        // if the brand doesn't exist, an error is thrown.
        await brandModuleService.retrieveBrand(additional_data.brand_id as string)

        const remoteLink = container.resolve(
            ContainerRegistrationKeys.REMOTE_LINK
        )
        const logger = container.resolve(
            ContainerRegistrationKeys.LOGGER
        )

        const links = []

        // link products to brands
        for (const product of products) {
            links.push({
                [Modules.PRODUCT]: {
                    product_id: product.id,
                },
                [BRAND_MODULE]: {
                    brand_id: additional_data.brand_id,
                },
            })
        }

        await remoteLink.create(links)

        logger.info("Linked brand to products")

        return new StepResponse(links, links)
    }),
    (async (links, { container }) => {
        if (!links.length) {
            return
        }

        const remoteLink = container.resolve(
            ContainerRegistrationKeys.REMOTE_LINK
        )

        await remoteLink.dismiss(links)
    })
)