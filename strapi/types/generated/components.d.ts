import type { Schema, Struct } from '@strapi/strapi';

export interface ServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_service_items';
  info: {
    description: 'A title and a short description (challenges and areas of expertise)';
    displayName: 'Item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Page title and description for search engines and social sharing';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'service.item': ServiceItem;
      'shared.seo': SharedSeo;
    }
  }
}
