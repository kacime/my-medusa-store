import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import {
    ContainerRegistrationKeys,
  } from "@medusajs/framework/utils"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const query = req.scope.resolve(
      ContainerRegistrationKeys.QUERY
    )
  
    const { data: [ brand ] } = await query.graph({
      entity: "brand",
      fields: ["products.*"],
      filters: {
        id: req.params.id,
      },
    })
  
    res.json({ products: brand.products })
  }