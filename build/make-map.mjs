import fs from 'fs';
import * as topo from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import * as simp from 'topojson-simplify';
let us = JSON.parse(fs.readFileSync('node_modules/us-atlas/states-albers-10m.json'));
us = simp.presimplify(us); us = simp.simplify(us, 2.5);
const states = topo.feature(us, us.objects.states).features;
const path = geoPath(null).digits(1);
const proj = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const cities = JSON.parse(fs.readFileSync('cities.json'));
const out = { states: states.map(f => ({ name: f.properties.name, d: path(f) })),
  cities: cities.map(([st, ab, c, la, lo]) => { const p = proj([lo, la]); return { st, ab, c, x: p ? +p[0].toFixed(1) : null, y: p ? +p[1].toFixed(1) : null }; }),
 };
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.states.length, 'states', out.cities.filter(c => c.x == null).map(c => c.c), Math.round(JSON.stringify(out).length / 1024) + 'KB');
