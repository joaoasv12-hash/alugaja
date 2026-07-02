import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Abstração de armazenamento. Em produção, trocar por Cloudinary/S3.
interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImagem(buffer: Buffer, nomeOriginal: string): Promise<UploadResult> {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return uploadCloudinary(buffer, nomeOriginal);
  }
  return uploadLocal(buffer, nomeOriginal);
}

async function uploadLocal(buffer: Buffer, nomeOriginal: string): Promise<UploadResult> {
  const ext = path.extname(nomeOriginal).toLowerCase() || ".jpg";
  const publicId = crypto.randomUUID();
  const nomeArquivo = `${publicId}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nomeArquivo), buffer);

  return {
    url: `/uploads/${nomeArquivo}`,
    publicId,
  };
}

async function uploadCloudinary(buffer: Buffer, nomeOriginal: string): Promise<UploadResult> {
  const { v2: cloudinary } = await import("cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const resultado = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cloudinary.uploader.upload_stream({ folder: "alugaja/imoveis", resource_type: "image" }, (err: any, res: any) => {
      if (err || !res) reject(err);
      else resolve(res as { secure_url: string; public_id: string });
    }).end(buffer);
  });

  return { url: resultado.secure_url, publicId: resultado.public_id };
}

export async function excluirImagem(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  const { v2: cloudinary } = await import("cloudinary");
  await cloudinary.uploader.destroy(publicId);
}
