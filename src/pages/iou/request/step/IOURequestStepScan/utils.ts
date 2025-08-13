import ImageSize from 'react-native-image-size';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';

type ImageObject = {
    file: FileObject;
    filename: string;
    source: string;
};

export async function cropReceiptToAspectRatio(image: ImageObject, aspectRatioWidth?: number, aspectRatioHeight?: number, verticalAlignTop?: boolean): Promise<ImageObject> {
    if (!aspectRatioWidth || !aspectRatioHeight) {
        return image;
    }

    const imageSize = await ImageSize.getSize(image.source);
    const isRotated = imageSize.rotation === 90 || imageSize.rotation === 270;
    const imageWidth = isRotated ? imageSize.height : imageSize.width;
    const imageHeight = isRotated ? imageSize.width : imageSize.height;
    const sourceAspectRatio = imageWidth / imageHeight;
    const targetAspectRatio = aspectRatioWidth / aspectRatioHeight;

    let originX = 0;
    let originY = 0;
    let width = imageWidth;
    let height = imageHeight;
    if (sourceAspectRatio > targetAspectRatio) {
        width = height * targetAspectRatio;
        originX = (imageWidth - width) / 2;
    } else {
        height = width * (aspectRatioHeight / aspectRatioWidth);
        originY = verticalAlignTop ? 0 : (imageHeight - height) / 2;
    }

    const croppedFilename = `receipt_cropped_${Date.now()}.png`;
    const croppedImage = await cropOrRotateImage(image.source, [{crop: {originX, originY, width, height}}], {compress: 1, name: croppedFilename, type: 'png'});
    if (!croppedImage.uri || !croppedImage.name) {
        return image;
    }
    return {file: croppedImage, filename: croppedImage.name, source: croppedImage.uri};
}
