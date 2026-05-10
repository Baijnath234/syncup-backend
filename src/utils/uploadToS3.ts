import { awsBucketName, s3 } from "../config/aws";

const hasRealAwsCredentials = () =>
  Boolean(
    awsBucketName &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      !process.env.AWS_ACCESS_KEY_ID.startsWith("your_") &&
      !process.env.AWS_SECRET_ACCESS_KEY.startsWith("your_"),
  );

export const uploadToS3 = async (file: Express.Multer.File, folder = "uploads") => {
  const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

  if (!hasRealAwsCredentials()) {
    return `local://${key}`;
  }

  const uploaded = await s3
    .upload({
      Bucket: awsBucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();

  return uploaded.Location;
};
