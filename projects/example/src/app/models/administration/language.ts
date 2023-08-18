import { Attribute, BaseModel, BaseModelConfig } from "@rosoftlab/core";

@BaseModelConfig({
    type: 'language',
})
export class Language extends BaseModel {
    @Attribute({ serializedName: 'id' })
    override id: string | undefined;

    @Attribute({ serializedName: 'name' })
    name: string | undefined;

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
