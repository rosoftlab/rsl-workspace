import { Attribute, BaseModel, BaseModelConfig, GridLayout } from '@rosoftlab/core';
@BaseModelConfig({
    type: 'language',
})
export class Language extends BaseModel {
    @Attribute({ serializedName: 'id' })
    override id: string | undefined;

    @GridLayout('General.Name', null, 1)
    @Attribute({ serializedName: 'name' })
    name: string | undefined;

    @GridLayout('General.Code', null, 1)
    @Attribute({ serializedName: 'code' })
    code: string | undefined;

    @Attribute({ serializedName: 'language_culture' })
    languageCulture: string | undefined;

    @Attribute({ serializedName: 'flag_image_fileName' })
    flagImageFileName: string | undefined;

    @Attribute({ serializedName: 'rtl' })
    rtl: boolean | undefined;

    @Attribute({ serializedName: 'published' })
    published: boolean | undefined;

    @Attribute({ serializedName: 'displayOrder' })
    displayOrder: number | undefined;
}
