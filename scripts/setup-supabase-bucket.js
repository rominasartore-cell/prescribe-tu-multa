/**
 * Setup script to create the 'certificados' bucket in Supabase Storage
 * Run this once to initialize the storage bucket for PDF uploads
 *
 * Usage: node scripts/setup-supabase-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

async function setupBucket() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const bucketName = 'certificados';

    console.log(`🔍 Checking if bucket '${bucketName}' exists...`);

    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      process.exit(1);
    }

    const bucketExists = buckets.some(b => b.name === bucketName);

    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' already exists`);
      return;
    }

    console.log(`📦 Creating bucket '${bucketName}'...`);

    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['application/pdf'],
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      process.exit(1);
    }

    console.log(`✅ Bucket '${bucketName}' created successfully!`);
    console.log(`\nBucket details:
- Name: ${data.name}
- Public: ${data.public}
- Max file size: unlimited (default Supabase limit: 5GB)

You can now upload PDFs to the 'certificados' bucket.`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

setupBucket();
