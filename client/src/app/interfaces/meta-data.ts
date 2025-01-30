export interface MetaData {
    description: string;
    image: string;
}

export const getImagePath = (prefix: string, imagePath: string) => `${prefix}/${imagePath}.png`;
