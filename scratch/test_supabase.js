
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

async function testSupabase() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Try to list buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Connection Error:', bucketError.message);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log('Available Buckets:', buckets.map(b => b.name).join(', '));

    // Test 2: Check if ai-models bucket exists
    const bucketName = process.env.SUPABASE_BUCKET || 'ai-models';
    const exists = buckets.find(b => b.name === bucketName);
    
    if (exists) {
      console.log(`Bucket "${bucketName}" is ready.`);
    } else {
      console.warn(`Bucket "${bucketName}" not found. You may need to create it in Supabase Dashboard.`);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSupabase();
