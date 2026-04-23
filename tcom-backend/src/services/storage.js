const sharp = require('sharp');
const { supabase } = require('./supabase');

async function uploadImage({ buffer, bucket, path, width, height }) {
  const resized = await sharp(buffer).resize(width, height, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
  await supabase.storage.from(bucket).upload(path, resized, { upsert: true, contentType: 'image/webp' });
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function uploadPostMedia({ buffer, path }) {
  const resized = await sharp(buffer)
    .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();
  await supabase.storage.from('post-media').upload(path, resized, { upsert: true, contentType: 'image/webp' });
  return supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;
}

module.exports = { uploadImage, uploadPostMedia };
