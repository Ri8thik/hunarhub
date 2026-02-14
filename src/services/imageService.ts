// Image Service - Convert images to base64 and save in Firestore

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

// Validate file before processing
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, WebP images allowed' };
  }
  if (file.size > MAX_FILE_SIZE * 3) {
    // Allow up to 3MB before compression, will be compressed to under 1MB
    return { valid: false, error: 'Image too large. Maximum 3MB allowed' };
  }
  return { valid: true };
};

// Compress and convert image to base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if too large
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (0.7 quality)
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Process multiple images to base64
export const processMultipleImages = async (
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<{ base64Images: string[]; errors: string[] }> => {
  const base64Images: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const validation = validateImage(file);

    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`);
      continue;
    }

    try {
      const base64 = await imageToBase64(file);
      base64Images.push(base64);
      if (onProgress) onProgress(i + 1, files.length);
    } catch {
      errors.push(`${file.name}: Failed to process`);
    }
  }

  return { base64Images, errors };
};

// Get base64 string size in KB
export const getBase64Size = (base64: string): number => {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.round((base64.length * 3 / 4 - padding) / 1024);
};
