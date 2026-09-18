const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://xasojoefwugsvyzhdhlz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc29qb2Vmd3Vnc3Z5emhkaGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDY4OTMsImV4cCI6MjA5NzcyMjg5M30.HlNDmVDp-zr-jiIj1ww2qFhI4NbQmV1MslKn_2T_h4o'
);

const tables = ['speakers', 'team_members', 'partners', 'event_settings', 'registrations', 'leads'];

async function fetchAll() {
  console.log('Attempting to fetch data from Supabase...');
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        if (error.code === '42P01') {
          console.log(`Table '${table}' does not exist.`);
        } else {
          console.log(`Error fetching '${table}':`, error.message);
        }
      } else {
        console.log(`Successfully fetched ${data.length} records from '${table}'.`);
        fs.writeFileSync(path.join(process.cwd(), `${table}_dump.json`), JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.log(`Fetch failed for ${table}: ${err.message}`);
    }
  }
}

fetchAll();
