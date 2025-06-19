const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadRSIToSupabase({ label, rsi_value, fetched_at }) {
  const { error } = await supabase
    .from('investing_rsi')
    .insert([
      { label, rsi_value, fetched_at }
    ]);
  if (error) {
    console.error('Supabase 업로드 오류:', error);
  } else {
    console.log(`${label} RSI(14) 업로드 성공`);
  }
}

module.exports = { supabase, uploadRSIToSupabase }; 