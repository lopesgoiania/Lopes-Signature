import campaigns from "../../campaigns/manifest.json";

/** Curate public galleries without deleting historical catalog records. */
export function campaignCatalog(properties: any[]): any[] {
  return campaigns.flatMap((campaign) => {
    const property = properties.find((p) => p.id === campaign.propertyId);
    if (!property) return [];
    return [
      {
        ...property,
        ...("card" in campaign ? campaign.card : {}),
        id: campaign.slug,
        title: campaign.title,
        landingPath: `/${campaign.slug}`,
        sourcePropertyId: property.id,
      },
    ];
  });
}
