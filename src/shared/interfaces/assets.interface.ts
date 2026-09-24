export interface AssetInterface {
    name: AssetFileEnum
    file: string
}

export enum AssetFileEnum {
    LOGO_GRUPO_FLESAN = 'LOGO_GRUPO_FLESAN',
    CINTA_LOGOS = 'CINTA_LOGOS',
    USER_TEMPLATE = 'USER_TEMPLATE',
    LOADER = 'LOADER',
    CHROME = 'CHROME'
}

