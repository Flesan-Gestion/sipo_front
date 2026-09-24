import axios from "axios";
import { ImageInterface } from "../interfaces/ImageInterface";

export class ImageService {

    static async getImages(): Promise<ImageInterface[]> {
        const response = await axios.get("https://api.grupoflesan.com/api/getImages");
        return response.data;
    }
}