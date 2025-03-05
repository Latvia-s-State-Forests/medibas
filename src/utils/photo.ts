import * as FileSystem from "expo-file-system";

export const PHOTOS_DIR_NAME = "photos";
const PHOTOS_DIR = FileSystem.documentDirectory + "/" + PHOTOS_DIR_NAME;

/**
 * Move a photo from the temporary directory to the photos directory and return the new file name.
 */
export async function movePhoto(uri: string, id: string) {
    const oldFileName = uri.split("/").pop();
    const fileExtension = oldFileName?.split(".").pop();
    if (!fileExtension) {
        throw new Error("Missing file extension");
    }

    const documentDirectoryFiles = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
    const photosDirectoryExists = documentDirectoryFiles.includes(PHOTOS_DIR_NAME);
    if (!photosDirectoryExists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR);
    }

    const newFileName = id + "." + fileExtension;
    const newUri = PHOTOS_DIR + "/" + newFileName;
    await FileSystem.moveAsync({ from: uri, to: newUri });
    return newFileName;
}

export function getPhotoForFormData(fileName: string) {
    return {
        uri: PHOTOS_DIR + "/" + fileName,
        name: fileName,
        type: "image/" + fileName.split(".").pop(),
    };
}
