import logoGrupoFlesan from "../../assets/img/logo_grupo_flesan.png";
import userTemplate from "../../assets/img/user_template.png";
import cintaLogos from "../../assets/img/cinta_logos.png";
import loader from "../../assets/svg/loader.svg";
import chrome from "../../assets/svg/chrome.svg";
import { AssetFileEnum, AssetInterface } from "../interfaces/assets.interface";

export const Assets: AssetInterface[] = [
    {
        name: AssetFileEnum.LOGO_GRUPO_FLESAN,
        file: logoGrupoFlesan
    },
    {
        name: AssetFileEnum.USER_TEMPLATE,
        file: userTemplate
    },
    {
        name: AssetFileEnum.CINTA_LOGOS,
        file: cintaLogos
    },
    {
        name: AssetFileEnum.LOADER,
        file: loader
    },
    {
        name: AssetFileEnum.CHROME,
        file: chrome
    },
]
