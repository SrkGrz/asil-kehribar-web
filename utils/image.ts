export interface ResizeImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    onInvalidFile?: (file: File) => void;
}

const DEFAULT_OPTIONS = {
    maxWidth: 1200,
    maxHeight: 1600,
    quality: 0.82
};

/**
 * Reads an image file and returns it as a downscaled JPEG data URL.
 * Resolves with an empty string when the file is not an image.
 */
export const resizeImageFile = (file: File, options: ResizeImageOptions = {}): Promise<string> => {
    const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

    return new Promise(resolve => {
        if (!file.type.startsWith('image/')) {
            options.onInvalidFile?.(file);
            resolve('');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(reader.result as string);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
};

/** Resizes every image in the list, dropping files that could not be processed. */
export const resizeImageFiles = async (
    files: FileList | File[],
    options: ResizeImageOptions = {}
): Promise<string[]> => {
    const results = await Promise.all(Array.from(files).map(file => resizeImageFile(file, options)));
    return results.filter(Boolean);
};
